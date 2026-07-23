#!/usr/bin/env python3
r"""
EUshop AI Orchestrator v1.3.0
=============================

Windows-first, standard-library-only supervisor for Claude Code, Codex CLI,
Hermes Agent, Free Claude Code wrappers, and isolated Git worktree sidecars.

Important behavior:
- Existing AI processes are never killed or replaced.
- Only exact agent executables count as an external primary; ChatGPT.exe,
  Python helpers, and Node helpers are ignored.
- A provider is not considered usable merely because --version works.
- Sidecar work starts only after a real terminal-write capability probe.
- Tasks use separate Git branches and worktrees.
- No automatic merge to main, deployment, force-push, or destructive reset.
- Failed or temporarily blocked provider work is preserved with logs/evidence.
- Default mode uses only fcc-claude and fcc-codex; direct account CLIs are opt-in.
- Provider probes are bounded and print progress, so doctor does not look frozen.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import contextlib
import dataclasses
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time
import traceback
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Optional, Sequence

VERSION = "1.3.0"
DEFAULT_REPO = Path(r"D:\CODING\eushop")
PROVIDER_ORDER = ("fcc-claude", "fcc-codex", "hermes", "codex", "claude")
DEFAULT_PROVIDERS = ("fcc-claude", "fcc-codex")

MASTER_DIRECTIVE = r"""
# EUshop Continuous Execution Directive

Preserve the original agent and all valid existing repository work. Sidecars are
accelerators, not replacements.

Before editing, read applicable AGENTS.md, CLAUDE.md, README.md, SECURITY.md,
DEVELOPMENT.md, STATUS.md, COMPLIANCE_GAPS.md, architecture plans, and nested
instruction files.

Work toward:
- EUshop v88: truthful marketplace reconstruction, origin-led discovery,
  Product Passport information, seller storefronts, functional cart/checkout,
  accessibility, performance, localization, SEO, privacy-aware analytics,
  reliable CI, and evidence-backed release quality.
- EUshop v99: a real mobile application and reproducible Android build path,
  coherent navigation, API contracts, secure authentication/storage, buyer and
  seller journeys, offline recovery, deep links, permissions discipline,
  observability, accessibility, app-store readiness, and auditable pipelines.

Do not claim a feature is complete merely because a file, screen, test, workflow,
or document exists. Record changed files, exact commands, exit codes, tests,
builds, artifacts, commit hashes, limitations, and external requirements.

Never expose or commit secrets. Do not execute credential-harvesting code or
workflows. Never deploy, merge directly to a protected default branch,
force-push, rewrite shared history, run destructive resets/cleans, make charges,
purchase services, alter external accounts, fabricate credentials or legal
approval, or delete production data.

Each sidecar must remain in its assigned branch/worktree, implement rather than
only propose, validate relevant changes, and leave a review-ready commit or a
truthful blocked result.
""".strip()

DEFAULT_TASKS = (
    {
        "title": "Baseline audit and evidence ledgers",
        "priority": 10,
        "paths": ["docs/v88", "docs/v99"],
        "prompt": (
            "Read current repository instructions and create/update truthful v88 "
            "and v99 baseline audits, constraints, evidence ledgers, attempted "
            "commands, current failures, architecture contradictions and repair order."
        ),
    },
    {
        "title": "Repair critical security and CodeQL findings",
        "priority": 20,
        "paths": ["services", "packages", ".github"],
        "prompt": (
            "Reproduce current CodeQL/security findings, implement root-cause fixes, "
            "add regression tests, and preserve security gates. Do not execute or "
            "normalize credential-harvesting paths."
        ),
    },
    {
        "title": "Make CI and release checks truthful and reliable",
        "priority": 30,
        "paths": [".github/workflows", "scripts", "infrastructure"],
        "prompt": (
            "Audit duplicated/racing workflows, real commands, caching, permissions, "
            "security scans, Android/static-site artifacts and missing-secret behavior. "
            "Fix verified defects without false-green skips."
        ),
    },
    {
        "title": "Reconstruct v88 web discovery and design system",
        "priority": 40,
        "paths": ["apps/web"],
        "prompt": (
            "Implement the Living European Pantry experience across discovery, "
            "search, country/category exploration, truthful demo fallbacks, Product "
            "Passport, seller visibility, loading/empty/error states, responsive "
            "navigation and accessibility. Preserve real static-export/base-path rules."
        ),
    },
    {
        "title": "Harden backend marketplace and checkout flows",
        "priority": 50,
        "paths": ["services/core-service", "db"],
        "prompt": (
            "Trace real product, seller, cart, checkout, payment and order flows. "
            "Improve authorization, server-authoritative totals/inventory, VAT/shipping "
            "states, idempotency, webhook confirmation, recovery and tests. Never charge."
        ),
    },
    {
        "title": "Productionize EUshop v99 mobile foundation",
        "priority": 60,
        "paths": ["apps/mobile", "packages"],
        "prompt": (
            "Establish deterministic mobile install/build behavior, one navigation "
            "approach, compatible Expo/React Native dependencies, strict type checking, "
            "secure storage, API boundaries, preview artifact workflow and truthful "
            "external-account blockers."
        ),
    },
    {
        "title": "Accessibility performance SEO and analytics verification",
        "priority": 70,
        "paths": ["apps/web", "docs/quality"],
        "prompt": (
            "Audit and improve keyboard/focus behavior, labels, contrast, motion, touch "
            "targets, loading performance, images, metadata, structured data and "
            "privacy-aware factual analytics. Record before/after evidence."
        ),
    },
    {
        "title": "Privacy compliance and marketplace truth review",
        "priority": 80,
        "paths": ["docs/compliance", "legal", "services/core-service"],
        "prompt": (
            "Map GDPR/ePrivacy, DSA, trader disclosure, consumer rights, GPSR, food "
            "information/allergens, VAT and DAC7 considerations to actual code/fields/UI. "
            "Implement supported repository-side gaps and flag qualified-review needs."
        ),
    },
)

SECRET_PATTERNS = (
    re.compile(r"(?i)\bsk-[a-z0-9_-]{8,}\b"),
    re.compile(r"(?i)\bgh[pousr]_[a-z0-9]{12,}\b"),
    re.compile(
        r"(?i)\b(api[_-]?key|auth[_-]?token|access[_-]?token|secret|password)"
        r"\s*[:=]\s*([^\s\"']+)"
    ),
)

FAILURE_RULES = (
    (
        "AUTHENTICATION_FAILED",
        re.compile(
            r"(?i)(401|invalid api key|unauthorized|authentication failed|"
            r"not logged in|login required|please .*login|invalid token)"
        ),
    ),
    (
        "USAGE_LIMIT",
        re.compile(
            r"(?i)(hit your usage limit|usage limit|weekly limit|monthly limit|"
            r"credit balance is too low|try again at|free quota has been exhausted|"
            r"allocationquota\.freetieronly|free tier.*exhausted|insufficient quota)"
        ),
    ),
    ("RATE_LIMITED", re.compile(r"(?i)(429|rate.?limit|quota exceeded|too many requests)")),
    ("MODEL_UNAVAILABLE", re.compile(r"(?i)(model .*not found|unknown model|unsupported model)")),
    (
        "PROVIDER_NOT_CONFIGURED",
        re.compile(r"(?i)(provider .*not configured|no model configured|setup required|missing provider)"),
    ),
    (
        "CONNECTION_FAILED",
        re.compile(r"(?i)(connection refused|could not connect|network unreachable|timed out)"),
    ),
    (
        "NO_RESUMABLE_SESSION",
        re.compile(r"(?i)(no .*session|no .*conversation|nothing to resume|rollout.*not found)"),
    ),
)


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def stamp() -> str:
    return dt.datetime.now().strftime("%Y%m%d-%H%M%S")


def slug(value: str, limit: int = 58) -> str:
    result = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "task"
    return result[:limit].rstrip("-")


def short_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8", "replace")).hexdigest()[:8]


def redact(value: str) -> str:
    result = value
    for pattern in SECRET_PATTERNS:
        if pattern.groups >= 2:
            result = pattern.sub(lambda match: f"{match.group(1)}=[REDACTED]", result)
        else:
            result = pattern.sub("[REDACTED]", result)
    return result


def info(message: str) -> None:
    print(f"[INFO] {message}", flush=True)


def ok(message: str) -> None:
    print(f"[OK]   {message}", flush=True)


def warn(message: str) -> None:
    print(f"[WARN] {message}", flush=True)


def fail(message: str) -> None:
    print(f"[FAIL] {message}", flush=True)


def atomic_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + f".tmp-{os.getpid()}-{threading.get_ident()}")
    temporary.write_text(text, encoding="utf-8")
    os.replace(temporary, path)


def atomic_json(path: Path, value: Any) -> None:
    atomic_text(path, json.dumps(value, indent=2, ensure_ascii=False, default=str) + "\n")


def read_json(path: Path, default: Any = None) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return default


def replace_retry(source: Path, destination: Path, attempts: int = 12) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    last_error: Optional[OSError] = None
    for attempt in range(attempts):
        try:
            os.replace(source, destination)
            return
        except OSError as exc:
            last_error = exc
            time.sleep(min(1.5, 0.08 * (2**attempt)))
    if last_error:
        raise last_error


def prepare_command(argv: Sequence[str]) -> list[str]:
    if not argv:
        raise ValueError("empty command")
    executable = argv[0]
    resolved = shutil.which(executable) or executable
    complete = [resolved, *argv[1:]]
    if os.name == "nt" and Path(resolved).suffix.lower() in {".cmd", ".bat"}:
        return ["cmd.exe", "/d", "/s", "/c", subprocess.list2cmdline(complete)]
    return complete


def run_capture(
    argv: Sequence[str],
    *,
    cwd: Optional[Path] = None,
    timeout: int = 60,
    env: Optional[dict[str, str]] = None,
) -> tuple[int, str]:
    try:
        completed = subprocess.run(
            prepare_command(argv),
            cwd=str(cwd) if cwd else None,
            env=env,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            errors="replace",
            timeout=timeout,
            check=False,
        )
        return completed.returncode, redact(completed.stdout or "")
    except subprocess.TimeoutExpired as exc:
        output = exc.stdout or ""
        if isinstance(output, bytes):
            output = output.decode("utf-8", "replace")
        return 124, redact(str(output) + "\n[TIMEOUT]")
    except OSError as exc:
        return 127, redact(f"{type(exc).__name__}: {exc}")


def git(repo: Path, *arguments: str, timeout: int = 180) -> tuple[int, str]:
    return run_capture(["git", "-C", str(repo), *arguments], timeout=timeout)


def ensure_repo(repo: Path) -> None:
    if not repo.exists():
        raise SystemExit(f"Repository does not exist: {repo}")
    if not shutil.which("git"):
        raise SystemExit("Git was not found on PATH.")
    code, output = git(repo, "rev-parse", "--show-toplevel")
    if code != 0:
        raise SystemExit(f"Not a Git repository: {repo}\n{output}")


def pid_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    if os.name == "nt":
        code, _ = run_capture(
            [
                "powershell.exe",
                "-NoProfile",
                "-Command",
                f"if (Get-Process -Id {pid} -ErrorAction SilentlyContinue) "
                "{ exit 0 } else { exit 1 }",
            ],
            timeout=10,
        )
        return code == 0
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def process_snapshot() -> list[dict[str, Any]]:
    if os.name == "nt":
        command = r"""
$items = Get-CimInstance Win32_Process |
  Select-Object ProcessId, Name, CommandLine
$items | ConvertTo-Json -Compress
"""
        code, output = run_capture(
            ["powershell.exe", "-NoProfile", "-Command", command],
            timeout=30,
        )
        if code != 0 or not output.strip():
            return []
        try:
            parsed = json.loads(output)
        except json.JSONDecodeError:
            return []
        if isinstance(parsed, dict):
            parsed = [parsed]
        return [
            {
                "pid": int(item.get("ProcessId") or 0),
                "name": str(item.get("Name") or ""),
                "cmdline": str(item.get("CommandLine") or ""),
            }
            for item in parsed
            if isinstance(item, dict)
        ]

    code, output = run_capture(["ps", "-eo", "pid=,comm=,args="], timeout=20)
    if code != 0:
        return []
    result = []
    for line in output.splitlines():
        match = re.match(r"\s*(\d+)\s+(\S+)\s*(.*)", line)
        if match:
            result.append(
                {
                    "pid": int(match.group(1)),
                    "name": match.group(2),
                    "cmdline": match.group(3),
                }
            )
    return result


def running_agents() -> list[dict[str, Any]]:
    exact = {
        "claude": "claude",
        "claude.exe": "claude",
        "codex": "codex",
        "codex.exe": "codex",
        "hermes": "hermes",
        "hermes.exe": "hermes",
        "fcc-claude": "fcc-claude",
        "fcc-claude.exe": "fcc-claude",
        "fcc-codex": "fcc-codex",
        "fcc-codex.exe": "fcc-codex",
    }
    result = []
    for item in process_snapshot():
        if int(item.get("pid") or 0) == os.getpid():
            continue
        name = Path(str(item.get("name") or "")).name.lower()
        provider = exact.get(name)
        if provider:
            result.append(
                {
                    "pid": int(item["pid"]),
                    "provider": provider,
                    "name": item.get("name", ""),
                }
            )
    return result


def classify(code: int, output: str) -> str:
    for name, pattern in FAILURE_RULES:
        if pattern.search(output):
            return name
    return "PROCESS_EXITED_ZERO" if code == 0 else "PROCESS_FAILED"


def last_line(output: str, limit: int = 600) -> str:
    line = next((line.strip() for line in reversed(output.splitlines()) if line.strip()), "")
    return line[:limit]


def cooldown_from(output: str) -> str:
    match = re.search(
        r"(?i)(?:try again at|resets? at|available at)\s+([^.\r\n\"}]+)",
        output,
    )
    return match.group(1).strip() if match else ""


@dataclasses.dataclass(frozen=True)
class Paths:
    repo: Path
    root: Path
    pending: Path
    running: Path
    done: Path
    failed: Path
    logs: Path
    results: Path
    state: Path
    worktrees: Path
    stop: Path
    lock: Path
    directive: Path
    dashboard: Path
    provider_state: Path
    seeded: Path

    @classmethod
    def create(cls, repo: Path) -> "Paths":
        root = repo / ".ai-orchestrator"
        instance = cls(
            repo=repo,
            root=root,
            pending=root / "tasks" / "pending",
            running=root / "tasks" / "running",
            done=root / "tasks" / "done",
            failed=root / "tasks" / "failed",
            logs=root / "logs",
            results=root / "results",
            state=root / "state",
            worktrees=repo.parent / f"{repo.name}-agent-worktrees",
            stop=root / "STOP",
            lock=root / "orchestrator.lock.json",
            directive=root / "MASTER_DIRECTIVE.md",
            dashboard=root / "STATUS.md",
            provider_state=root / "state" / "providers.json",
            seeded=root / "state" / "default-tasks-seeded",
        )
        for folder in (
            instance.pending,
            instance.running,
            instance.done,
            instance.failed,
            instance.logs,
            instance.results,
            instance.state,
            instance.worktrees,
        ):
            folder.mkdir(parents=True, exist_ok=True)
        atomic_text(instance.directive, MASTER_DIRECTIVE + "\n")
        return instance


class TaskStore:
    def __init__(self, paths: Paths):
        self.paths = paths
        self.lock = threading.RLock()

    def files(self, directory: Path) -> list[Path]:
        return sorted(directory.glob("*.json"))

    def add(
        self,
        *,
        title: str,
        prompt: str,
        owned_paths: Sequence[str] = (),
        priority: int = 100,
        providers: Sequence[str] = (),
    ) -> dict[str, Any]:
        task_id = (
            f"{slug(title)}-{stamp()}-"
            f"{short_hash(prompt + str(time.time_ns()))[:4]}"
        )
        task = {
            "id": task_id,
            "title": title.strip(),
            "prompt": prompt.strip(),
            "owned_paths": [
                str(path).replace("\\", "/").strip("/")
                for path in owned_paths
                if path
            ],
            "priority": int(priority),
            "preferred_providers": list(providers),
            "status": "PENDING",
            "attempts": 0,
            "created_at": now(),
            "updated_at": now(),
            "branch": f"agent/{slug(task_id)}",
            "worktree": str(self.paths.worktrees / slug(task_id, 64)),
            "provider_history": [],
        }
        atomic_json(self.paths.pending / f"{task_id}.json", task)
        return task

    def seed_defaults(self) -> int:
        if self.paths.seeded.exists():
            return 0
        count = 0
        for task in DEFAULT_TASKS:
            self.add(
                title=task["title"],
                prompt=task["prompt"],
                owned_paths=task["paths"],
                priority=task["priority"],
            )
            count += 1
        atomic_text(self.paths.seeded, f"{now()} {count}\n")
        return count

    def load(self, directory: Path) -> list[dict[str, Any]]:
        result = []
        for file in self.files(directory):
            task = read_json(file)
            if isinstance(task, dict):
                task["_file"] = str(file)
                result.append(task)
        return result

    def pending_tasks(self) -> list[dict[str, Any]]:
        current = dt.datetime.now(dt.timezone.utc)
        result = []
        for task in self.load(self.paths.pending):
            not_before = str(task.get("not_before") or "")
            if not_before:
                with contextlib.suppress(ValueError):
                    if dt.datetime.fromisoformat(not_before) > current:
                        continue
            result.append(task)
        return sorted(
            result,
            key=lambda task: (
                int(task.get("priority", 100)),
                str(task.get("created_at", "")),
            ),
        )

    def running_tasks(self) -> list[dict[str, Any]]:
        return self.load(self.paths.running)

    def claim(self, task: dict[str, Any]) -> dict[str, Any]:
        with self.lock:
            source = Path(str(task["_file"]))
            destination = self.paths.running / source.name
            if not source.exists():
                raise FileNotFoundError(f"Task already claimed or missing: {source.name}")
            replace_retry(source, destination)
            payload = dict(task)
            payload.pop("_file", None)
            payload.update(
                {
                    "status": "RUNNING",
                    "claimed_at": now(),
                    "claim_pid": os.getpid(),
                    "updated_at": now(),
                }
            )
            atomic_json(destination, payload)
            payload["_file"] = str(destination)
            return payload

    def update(self, task: dict[str, Any]) -> None:
        payload = dict(task)
        file = Path(str(payload.pop("_file")))
        payload["updated_at"] = now()
        atomic_json(file, payload)

    def finish(self, task: dict[str, Any], success: bool, result: dict[str, Any]) -> None:
        with self.lock:
            source = Path(str(task["_file"]))
            destination = (self.paths.done if success else self.paths.failed) / source.name
            if source.exists():
                replace_retry(source, destination)
            payload = dict(task)
            payload.pop("_file", None)
            payload["status"] = "DONE" if success else "FAILED"
            payload["updated_at"] = now()
            payload["result"] = result
            atomic_json(destination, payload)
            atomic_json(self.paths.results / f"{task['id']}.json", result)

    def defer(self, task: dict[str, Any], diagnostic: str, minutes: int = 15) -> None:
        with self.lock:
            source = Path(str(task["_file"]))
            destination = self.paths.pending / source.name
            payload = dict(task)
            payload.pop("_file", None)
            payload["status"] = "PENDING"
            payload["updated_at"] = now()
            payload["last_diagnostic"] = diagnostic
            payload["not_before"] = (
                dt.datetime.now(dt.timezone.utc) + dt.timedelta(minutes=minutes)
            ).isoformat(timespec="seconds")
            atomic_json(source, payload)
            replace_retry(source, destination)

    def retry_failed(self, reset: bool) -> int:
        count = 0
        for source in self.files(self.paths.failed):
            task = read_json(source)
            if not isinstance(task, dict):
                continue
            destination = self.paths.pending / source.name
            if destination.exists():
                continue
            task.pop("result", None)
            task.pop("current_provider", None)
            task["status"] = "PENDING"
            task["updated_at"] = now()
            task.pop("not_before", None)
            if reset:
                task["attempts"] = 0
                task["provider_history"] = []
            atomic_json(source, task)
            replace_retry(source, destination)
            count += 1
        return count

    def recover_running(self, reset: bool) -> int:
        count = 0
        for source in self.files(self.paths.running):
            task = read_json(source)
            if not isinstance(task, dict):
                continue
            destination = self.paths.pending / source.name
            if destination.exists():
                continue
            for key in ("current_provider", "claim_pid", "claimed_at", "not_before"):
                task.pop(key, None)
            task["status"] = "PENDING"
            task["updated_at"] = now()
            if reset:
                task["attempts"] = 0
                task["provider_history"] = []
            atomic_json(source, task)
            replace_retry(source, destination)
            count += 1
        return count

    @staticmethod
    def overlap(first: Sequence[str], second: Sequence[str]) -> bool:
        left = [item.strip("/").lower() for item in first if item]
        right = [item.strip("/").lower() for item in second if item]
        return any(
            a == b or a.startswith(b + "/") or b.startswith(a + "/")
            for a in left
            for b in right
        )

    def next_task(self, active: Sequence[dict[str, Any]]) -> Optional[dict[str, Any]]:
        active_paths = [task.get("owned_paths") or [] for task in active]
        for task in self.pending_tasks():
            candidate = task.get("owned_paths") or []
            if not any(self.overlap(candidate, paths) for paths in active_paths):
                return task
        return None


@dataclasses.dataclass
class Provider:
    name: str
    executable: str
    kind: str
    version: str = ""
    help_text: str = ""
    available: bool = False
    health: str = "UNKNOWN"
    detail: str = ""
    auth_status: str = "UNKNOWN"
    probe_status: str = "NOT_RUN"
    write_capable: bool = False
    cooldown_until: str = ""


class ProviderManager:
    def __init__(
        self,
        paths: Paths,
        primary_provider: str = "auto",
        enabled_providers: Optional[Sequence[str]] = None,
        probe_timeout: int = 90,
    ):
        self.paths = paths
        self.primary_provider = primary_provider
        requested = tuple(enabled_providers or DEFAULT_PROVIDERS)
        self.enabled_providers = tuple(
            name for name in PROVIDER_ORDER if name in requested
        )
        if not self.enabled_providers:
            self.enabled_providers = DEFAULT_PROVIDERS
        self.probe_timeout = max(15, int(probe_timeout))
        self.providers: dict[str, Provider] = {}
        self.loads: dict[str, int] = {}
        self.lock = threading.RLock()
        self.fcc_process: Optional[subprocess.Popen[Any]] = None

    def candidates(self, name: str) -> list[str]:
        result = []
        direct = shutil.which(name)
        if direct:
            result.append(str(Path(direct).resolve()))
        if os.name == "nt":
            code, output = run_capture(["where.exe", name], timeout=15)
            if code == 0:
                for line in output.splitlines():
                    candidate = line.strip()
                    if candidate and Path(candidate).exists():
                        result.append(str(Path(candidate).resolve()))
        return list(dict.fromkeys(result))

    def executable(self, name: str) -> Optional[str]:
        candidates = self.candidates(name)
        if not candidates:
            return None
        repo = str(self.paths.repo.resolve()).lower().rstrip("\\/")
        outside = [
            candidate
            for candidate in candidates
            if not str(Path(candidate).resolve()).lower().startswith(repo + "\\")
            and not str(Path(candidate).resolve()).lower().startswith(repo + "/")
        ]
        if name.startswith("fcc-") and outside:
            return outside[0]
        return candidates[0]

    @staticmethod
    def kind(name: str) -> str:
        if name in {"claude", "fcc-claude"}:
            return "claude"
        if name in {"codex", "fcc-codex"}:
            return "codex"
        return "hermes" if name == "hermes" else "unknown"

    def environment(self, name: str) -> dict[str, str]:
        env = os.environ.copy()
        if name == "fcc-claude":
            for key in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_BASE_URL"):
                env.pop(key, None)
        if name == "fcc-codex":
            for key in ("OPENAI_API_KEY", "OPENAI_BASE_URL", "OPENAI_ORG_ID", "OPENAI_PROJECT_ID"):
                env.pop(key, None)
        env["NO_COLOR"] = "1"
        env["PYTHONUNBUFFERED"] = "1"
        return env

    def fcc_ports(self) -> list[int]:
        ports = [8082, 8000]
        for file in (
            Path.home() / ".fcc" / ".env",
            Path.home() / ".config" / "free-claude-code" / ".env",
        ):
            with contextlib.suppress(OSError):
                for line in file.read_text(encoding="utf-8-sig").splitlines():
                    match = re.match(r"\s*PORT\s*=\s*(\d+)", line)
                    if match:
                        ports.insert(0, int(match.group(1)))
        return list(dict.fromkeys(ports))

    def fcc_up(self) -> tuple[bool, str]:
        for port in self.fcc_ports():
            for suffix in ("/health", "/v1/models", "/admin", "/"):
                try:
                    request = urllib.request.Request(
                        f"http://127.0.0.1:{port}{suffix}",
                        headers={"User-Agent": f"EUshop-Orchestrator/{VERSION}"},
                    )
                    with urllib.request.urlopen(request, timeout=2) as response:
                        if response.status < 500:
                            return True, f"127.0.0.1:{port}"
                except urllib.error.HTTPError as exc:
                    if exc.code in {401, 403, 404, 405}:
                        return True, f"127.0.0.1:{port}"
                except (OSError, TimeoutError, urllib.error.URLError):
                    pass
        return False, "not responding on known ports"

    def ensure_fcc(self) -> tuple[bool, str]:
        up, detail = self.fcc_up()
        if up:
            return up, detail
        executable = self.executable("fcc-server")
        if not executable:
            return False, "fcc-server not found"
        log = open(self.paths.logs / "fcc-server.log", "a", encoding="utf-8")
        try:
            self.fcc_process = subprocess.Popen(
                prepare_command([executable]),
                cwd=str(self.paths.repo),
                stdin=subprocess.DEVNULL,
                stdout=log,
                stderr=subprocess.STDOUT,
                creationflags=int(getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0))
                if os.name == "nt"
                else 0,
            )
        except OSError as exc:
            log.close()
            return False, redact(str(exc))
        for _ in range(20):
            time.sleep(1)
            up, detail = self.fcc_up()
            if up:
                return up, detail
            if self.fcc_process.poll() is not None:
                return False, f"fcc-server exited {self.fcc_process.returncode}"
        return False, "fcc-server did not become ready"

    def auth_check(self, provider: Provider) -> tuple[str, str]:
        env = self.environment(provider.name)
        if provider.name == "claude":
            code, output = run_capture(
                [provider.executable, "auth", "status", "--text"],
                cwd=self.paths.repo,
                timeout=30,
                env=env,
            )
            return (
                ("AUTHENTICATED", last_line(output))
                if code == 0
                else ("AUTHENTICATION_FAILED", last_line(output) or "claude auth status failed")
            )
        if provider.name == "codex":
            code, output = run_capture(
                [provider.executable, "login", "status"],
                cwd=self.paths.repo,
                timeout=30,
                env=env,
            )
            if code == 0 and not re.search(r"(?i)not logged in", output):
                return "AUTHENTICATED", last_line(output)
            return "AUTHENTICATION_FAILED", last_line(output) or "codex login status failed"
        return "REQUIRES_PROBE", "verified by real write probe"

    def command(
        self,
        name: str,
        prompt: str,
        *,
        resume: bool = False,
        probe: bool = False,
    ) -> list[str]:
        provider = self.providers[name]
        help_text = provider.help_text.lower()
        turns = "8" if probe else "90"

        if provider.kind == "claude":
            args = [provider.executable]
            if resume and "--continue" in help_text:
                args.append("--continue")
            if "--dangerously-skip-permissions" in help_text:
                args.append("--dangerously-skip-permissions")
            if "--output-format" in help_text:
                args.extend(["--output-format", "stream-json"])
            if "--verbose" in help_text:
                args.append("--verbose")
            if "--max-turns" in help_text:
                args.extend(["--max-turns", turns])
            args.extend(["-p", prompt])
            return args

        if provider.kind == "codex":
            args = [provider.executable, "exec"]
            if "--dangerously-bypass-approvals-and-sandbox" in help_text:
                args.append("--dangerously-bypass-approvals-and-sandbox")
            else:
                if "--ask-for-approval" in help_text:
                    args.extend(["--ask-for-approval", "never"])
                if "--sandbox" in help_text:
                    args.extend(["--sandbox", "danger-full-access"])
                elif "--full-auto" in help_text:
                    args.append("--full-auto")
            if "--skip-git-repo-check" in help_text:
                args.append("--skip-git-repo-check")
            if "--json" in help_text:
                args.append("--json")
            if resume and "resume" in help_text:
                args.extend(["resume", "--last", prompt])
            else:
                args.append(prompt)
            return args

        if provider.kind == "hermes":
            args = [provider.executable]
            if resume and "--continue" in help_text:
                args.append("--continue")
            if "--yolo" in help_text:
                args.append("--yolo")
            args.append("chat")
            if "--toolsets" in help_text:
                args.extend(["--toolsets", "terminal"])
            if "--max-turns" in help_text:
                args.extend(["--max-turns", turns])
            if "--source" in help_text:
                args.extend(["--source", "tool"])
            args.extend(["-q", prompt])
            return args

        raise RuntimeError(f"Unsupported provider: {name}")

    def probe(self, provider: Provider) -> tuple[bool, str, str, str]:
        folder = Path(
            tempfile.mkdtemp(
                prefix=f"{slug(provider.name)}-",
                dir=str(self.paths.state),
            )
        )
        run_capture(["git", "init", "-q"], cwd=folder, timeout=30)
        marker = folder / "provider_probe.txt"
        token = f"EUshop-{provider.name}-{short_hash(now() + str(time.time_ns()))}"
        prompt = (
            "Use your terminal/file tools now. In the current directory, create "
            "provider_probe.txt whose complete contents, excluding the final newline, "
            f"are exactly: {token}. Verify the file, then reply DONE. Do not merely "
            "describe a command."
        )
        code, output = run_capture(
            self.command(provider.name, prompt, probe=True),
            cwd=folder,
            timeout=self.probe_timeout,
            env=self.environment(provider.name),
        )
        wrote = False
        with contextlib.suppress(OSError):
            wrote = marker.read_text(encoding="utf-8-sig").strip() == token

        if wrote:
            status = "WRITE_CAPABLE"
            detail = f"real write probe passed; exit={code}"
            capable = True
        elif code == 0:
            status = "NO_TOOL_USE"
            detail = (
                "provider returned success but did not create the file; "
                + (last_line(output) or "no useful output")
            )
            capable = False
        else:
            status = classify(code, output)
            detail = last_line(output) or f"probe exit={code}"
            capable = False

        atomic_json(
            self.paths.state / f"provider-probe-{slug(provider.name)}.json",
            {
                "checked_at": now(),
                "provider": provider.name,
                "executable": provider.executable,
                "status": status,
                "detail": detail,
                "exit_code": code,
                "output_tail": output[-4000:],
            },
        )
        with contextlib.suppress(OSError):
            shutil.rmtree(folder)
        return capable, status, detail, cooldown_from(output)

    def persist(self, fcc: tuple[bool, str]) -> None:
        atomic_json(
            self.paths.provider_state,
            {
                "checked_at": now(),
                "fcc_server": {"healthy": fcc[0], "detail": fcc[1]},
                "providers": {
                    name: dataclasses.asdict(provider)
                    for name, provider in self.providers.items()
                },
            },
        )

    def discover(self, probe: bool = True) -> dict[str, Provider]:
        fcc_requested = any(
            name.startswith("fcc-") for name in self.enabled_providers
        )
        fcc = (
            self.ensure_fcc()
            if fcc_requested
            else (False, "disabled by provider selection")
        )

        discovered: dict[str, Provider] = {}
        for name in PROVIDER_ORDER:
            if name not in self.enabled_providers:
                discovered[name] = Provider(
                    name=name,
                    executable="",
                    kind=self.kind(name),
                    health="DISABLED_BY_MODE",
                    detail=(
                        "not selected; enabled providers: "
                        + ", ".join(self.enabled_providers)
                    ),
                )
                continue

            info(f"Checking provider {name}...")
            executable = self.executable(name)
            if not executable:
                discovered[name] = Provider(
                    name=name,
                    executable="",
                    kind=self.kind(name),
                    health="COMMAND_NOT_FOUND",
                    detail="command not found",
                )
                continue

            env = self.environment(name)
            version_code, version_output = run_capture(
                [executable, "--version"],
                cwd=self.paths.repo,
                timeout=25,
                env=env,
            )
            version = next(
                (line.strip() for line in version_output.splitlines() if line.strip()),
                "",
            )[:180]

            commands = (
                [[executable, "exec", "--help"]]
                if self.kind(name) == "codex"
                else (
                    [[executable, "--help"], [executable, "chat", "--help"]]
                    if self.kind(name) == "hermes"
                    else [[executable, "--help"]]
                )
            )
            help_codes = []
            help_outputs = []
            for command in commands:
                code, output = run_capture(
                    command,
                    cwd=self.paths.repo,
                    timeout=25,
                    env=env,
                )
                help_codes.append(code)
                help_outputs.append(output)

            launchable = version_code == 0 and all(code in {0, 1, 2} for code in help_codes)
            provider = Provider(
                name=name,
                executable=executable,
                kind=self.kind(name),
                version=version,
                help_text="\n".join(help_outputs)[-30000:],
                health="EXECUTABLE_ONLY" if launchable else "DEGRADED",
                detail=f"version={version_code}; help={help_codes}",
            )
            discovered[name] = provider
            self.loads.setdefault(name, 0)

            if name.startswith("fcc-") and not fcc[0]:
                provider.health = "FCC_SERVER_UNAVAILABLE"
                provider.detail = fcc[1]
                continue
            if not launchable:
                provider.detail += "; " + (last_line(version_output) or "launcher failed")
                continue

            self.providers = discovered
            provider.auth_status, auth_detail = self.auth_check(provider)
            if provider.auth_status == "AUTHENTICATION_FAILED":
                provider.health = "AUTHENTICATION_FAILED"
                provider.detail = auth_detail
                continue
            if not probe:
                provider.health = "AUTHENTICATED_UNPROBED"
                provider.detail = auth_detail
                self.providers = discovered
                self.persist(fcc)
                continue

            provider.health = "PROBING"
            provider.detail = (
                f"real terminal-write probe running; timeout={self.probe_timeout}s"
            )
            self.providers = discovered
            self.persist(fcc)
            info(
                f"Probing {name} for real repository write capability "
                f"(up to {self.probe_timeout}s)..."
            )
            capable, status, detail, cooldown = self.probe(provider)
            provider.available = capable
            provider.write_capable = capable
            provider.probe_status = status
            provider.health = status
            provider.detail = detail
            provider.cooldown_until = cooldown

        self.providers = discovered
        self.persist(fcc)
        return discovered

    def usable(self, preferred: Sequence[str] = (), primary: bool = False) -> list[str]:
        order = list(preferred)
        if primary and self.primary_provider != "auto":
            order.append(self.primary_provider)
        order.extend(PROVIDER_ORDER)
        unique = list(dict.fromkeys(order))
        candidates = [
            name
            for name in unique
            if name in self.providers
            and self.providers[name].available
            and self.providers[name].write_capable
        ]
        return sorted(
            candidates,
            key=lambda name: (
                0 if name in preferred else 1,
                self.loads.get(name, 0),
                unique.index(name),
            ),
        )

    def disable(self, name: str, health: str, detail: str, output: str = "") -> None:
        with self.lock:
            provider = self.providers.get(name)
            if not provider:
                return
            provider.available = False
            provider.write_capable = False
            provider.health = health
            provider.detail = detail[:1000]
            provider.cooldown_until = cooldown_from(output)
            state = read_json(self.paths.provider_state, {})
            fcc_data = state.get("fcc_server", {}) if isinstance(state, dict) else {}
            self.persist(
                (
                    bool(fcc_data.get("healthy")),
                    str(fcc_data.get("detail", "")),
                )
            )


def worktree_for(repo: Path, task: dict[str, Any]) -> Path:
    branch = str(task["branch"])
    worktree = Path(str(task["worktree"]))
    worktree.parent.mkdir(parents=True, exist_ok=True)
    if worktree.exists():
        code, _ = git(worktree, "rev-parse", "--show-toplevel")
        if code == 0:
            return worktree
        if any(worktree.iterdir()):
            raise RuntimeError(f"Non-worktree directory already exists: {worktree}")
        worktree.rmdir()

    branch_code, _ = git(repo, "show-ref", "--verify", f"refs/heads/{branch}")
    command = (
        ["worktree", "add", str(worktree), branch]
        if branch_code == 0
        else ["worktree", "add", "-b", branch, str(worktree), "HEAD"]
    )
    code, output = git(repo, *command, timeout=300)
    if code != 0:
        raise RuntimeError(f"git worktree add failed:\n{output}")
    return worktree


def git_evidence(worktree: Path) -> dict[str, Any]:
    _, status = git(worktree, "status", "--porcelain=v1")
    _, head = git(worktree, "rev-parse", "HEAD")
    _, branch = git(worktree, "branch", "--show-current")
    base_code, base = git(worktree, "merge-base", "HEAD", "main")
    if base_code != 0:
        base_code, base = git(worktree, "merge-base", "HEAD", "master")
    commits = ""
    if base_code == 0:
        _, commits = git(worktree, "log", "--oneline", f"{base.strip()}..HEAD")
    return {
        "dirty": [line for line in status.splitlines() if line.strip()],
        "head": head.strip(),
        "branch": branch.strip(),
        "commits_ahead": [line for line in commits.splitlines() if line.strip()],
    }


def safe_commit(worktree: Path, title: str) -> dict[str, Any]:
    evidence = git_evidence(worktree)
    if not evidence["dirty"]:
        return {"committed": False, "reason": "working tree clean", "evidence": evidence}

    suspicious = re.compile(
        r"(?i)(^|/)(\.env($|\.)|.*\.(pem|p12|pfx|key)$|credentials[^/]*$|secrets?[^/]*$)"
    )
    filenames = []
    for line in evidence["dirty"]:
        value = line[3:] if len(line) > 3 else line
        if " -> " in value:
            value = value.split(" -> ", 1)[1]
        filenames.append(value.replace("\\", "/"))
    unsafe = [
        name
        for name in filenames
        if suspicious.search(name)
        and not re.search(r"(?i)(example|sample|template|dist)", name)
    ]
    if unsafe:
        return {
            "committed": False,
            "reason": "possible secret-bearing files require review",
            "files": unsafe,
            "evidence": evidence,
        }

    code, output = git(worktree, "add", "-A")
    if code != 0:
        return {"committed": False, "reason": "git add failed", "output": output[-2000:]}

    _, diff = git(worktree, "diff", "--cached", "--unified=0")
    if re.search(
        r"(?i)(api[_-]?key|auth[_-]?token|client[_-]?secret|private[_-]?key|password)"
        r"\s*[:=]\s*[\"']?[A-Za-z0-9/+_.=-]{12,}",
        diff,
    ):
        git(worktree, "reset", "--quiet")
        return {"committed": False, "reason": "possible secret detected in staged diff"}

    code, output = run_capture(
        [
            "git",
            "-C",
            str(worktree),
            "-c",
            "user.name=EUshop AI Orchestrator",
            "-c",
            "user.email=eushop-ai@local.invalid",
            "commit",
            "-m",
            f"agent: {title[:72]}",
        ],
        timeout=300,
    )
    return {
        "committed": code == 0,
        "reason": "commit created" if code == 0 else "git commit failed",
        "output": output[-2000:],
        "evidence": git_evidence(worktree),
    }


class Sidecar:
    def __init__(
        self,
        paths: Paths,
        store: TaskStore,
        providers: ProviderManager,
        timeout: int,
    ):
        self.paths = paths
        self.store = store
        self.providers = providers
        self.timeout = timeout

    def prompt(self, task: dict[str, Any]) -> str:
        owned = ", ".join(task.get("owned_paths") or []) or "(minimize edits)"
        return f"""
You are a write-capable EUshop sidecar agent.

TASK: {task.get('title', '')}

INSTRUCTIONS:
{task.get('prompt', '')}

ASSIGNED PATHS:
{owned}

BRANCH: {task.get('branch', '')}
WORKTREE: {task.get('worktree', '')}

Immediately use terminal tools in the current directory. Run git status, read
applicable repository instruction files, inspect the real implementation, make
the scoped changes, validate them, and commit valid work to this branch. Do not
only provide a plan.

Read the full safety/evidence directive at:
{self.paths.directive}

Do not merge to main, deploy, force-push, expose secrets, alter accounts, or
touch the primary working tree. Report exact commands, files, tests, commit hash,
limitations and blockers.
""".strip()

    def run(self, raw_task: dict[str, Any]) -> dict[str, Any]:
        try:
            task = self.store.claim(raw_task)
        except (OSError, FileNotFoundError) as exc:
            return {
                "title": raw_task.get("title", ""),
                "success": False,
                "transient": True,
                "status": "CLAIM_SKIPPED",
                "diagnostic": redact(str(exc)),
            }

        task_id = str(task["id"])
        started = now()
        try:
            worktree = worktree_for(self.paths.repo, task)
        except Exception as exc:
            result = {
                "task_id": task_id,
                "title": task["title"],
                "success": False,
                "status": "WORKTREE_FAILED",
                "diagnostic": redact(str(exc)),
                "started_at": started,
                "ended_at": now(),
            }
            self.store.finish(task, False, result)
            return result

        providers = self.providers.usable(task.get("preferred_providers") or [])
        if not providers:
            self.store.defer(task, "No write-capable provider", minutes=15)
            return {
                "task_id": task_id,
                "title": task["title"],
                "success": False,
                "transient": True,
                "status": "NO_WRITE_CAPABLE_PROVIDER",
                "diagnostic": "Task returned to pending queue.",
            }

        attempts = []
        success = False
        winner = ""
        for provider_name in providers:
            provider = self.providers.providers.get(provider_name)
            if not provider or not provider.available:
                continue
            task["current_provider"] = provider_name
            task["attempts"] = int(task.get("attempts") or 0) + 1
            task["provider_history"] = list(task.get("provider_history") or []) + [
                {"provider": provider_name, "started_at": now()}
            ]
            self.store.update(task)

            log = self.paths.logs / f"task-{slug(task_id,64)}-{provider_name}-{stamp()}.log"
            command = self.providers.command(provider_name, self.prompt(task))
            code, output = run_capture(
                command,
                cwd=worktree,
                timeout=self.timeout,
                env=self.providers.environment(provider_name),
            )
            atomic_text(
                log,
                f"[{now()}] provider={provider_name} exit={code}\n"
                + output
                + "\n",
            )
            evidence = git_evidence(worktree)
            has_work = bool(evidence["dirty"] or evidence["commits_ahead"])
            category = classify(code, output)
            if code == 0 and not has_work:
                category = "NO_WORK_PRODUCED"

            attempts.append(
                {
                    "provider": provider_name,
                    "exit_code": code,
                    "classification": category,
                    "log": str(log),
                    "tail": output[-4000:],
                    "git": evidence,
                }
            )
            if code == 0 and has_work:
                success = True
                winner = provider_name
                break

            if category in {
                "AUTHENTICATION_FAILED",
                "USAGE_LIMIT",
                "MODEL_UNAVAILABLE",
                "PROVIDER_NOT_CONFIGURED",
                "NO_WORK_PRODUCED",
            }:
                self.providers.disable(
                    provider_name,
                    category,
                    last_line(output) or "no repository changes produced",
                    output,
                )

        commit = safe_commit(worktree, task["title"])
        final = git_evidence(worktree)
        if final["commits_ahead"]:
            success = True

        last = attempts[-1] if attempts else {}
        diagnostic = (
            f"{last.get('provider', 'no-provider')}: "
            f"{last.get('classification', 'NO_OUTCOME')}; "
            f"exit={last.get('exit_code', 'unknown')}; "
            f"{last_line(str(last.get('tail', '')))}"
        )
        result = {
            "task_id": task_id,
            "title": task["title"],
            "success": success,
            "status": "READY_FOR_REVIEW" if success else "FAILED_OR_BLOCKED",
            "provider": winner,
            "diagnostic": diagnostic,
            "last_log": last.get("log", ""),
            "started_at": started,
            "ended_at": now(),
            "branch": task["branch"],
            "worktree": str(worktree),
            "attempts": attempts,
            "commit": commit,
            "git": final,
        }

        if not success and not self.providers.usable():
            self.store.defer(task, diagnostic, minutes=30)
            result["status"] = "DEFERRED_NO_PROVIDER"
            result["transient"] = True
            atomic_json(self.paths.results / f"{task_id}.json", result)
        else:
            self.store.finish(task, success, result)
        return result


class Orchestrator:
    def __init__(self, args: argparse.Namespace):
        self.repo = Path(args.repo).expanduser().resolve()
        ensure_repo(self.repo)
        self.paths = Paths.create(self.repo)
        self.store = TaskStore(self.paths)
        self.providers = ProviderManager(
            self.paths,
            args.primary_provider,
            enabled_providers=args.providers,
            probe_timeout=args.probe_timeout,
        )
        self.enabled_providers = tuple(args.providers)
        self.probe_timeout = args.probe_timeout
        self.max_parallel = args.max_parallel
        self.poll = args.poll_seconds
        self.task_timeout = args.task_timeout
        self.no_defaults = args.no_default_tasks
        self.primary_only = args.primary_only
        self.force_primary = args.force_primary
        self.stop_event = threading.Event()
        self.original_agents = running_agents()
        self.primary_thread: Optional[threading.Thread] = None
        self.primary_state: dict[str, Any] = {
            "status": "NOT_STARTED",
            "managed": False,
            "external_agents": self.original_agents,
        }
        self.futures: dict[concurrent.futures.Future[dict[str, Any]], dict[str, Any]] = {}

    def acquire_lock(self) -> None:
        lock = read_json(self.paths.lock, {})
        pid = int(lock.get("pid") or 0) if isinstance(lock, dict) else 0
        if pid and pid_alive(pid):
            raise SystemExit(f"Another orchestrator is running with PID {pid}.")
        atomic_json(
            self.paths.lock,
            {"pid": os.getpid(), "version": VERSION, "repo": str(self.repo), "started_at": now()},
        )

    def release_lock(self) -> None:
        lock = read_json(self.paths.lock, {})
        if isinstance(lock, dict) and int(lock.get("pid") or 0) == os.getpid():
            with contextlib.suppress(OSError):
                self.paths.lock.unlink()

    def signal(self, number: int, _frame: Any) -> None:
        warn(f"Signal {number} received. No AI agent will be forcibly terminated.")
        self.stop_event.set()

    def primary_loop(self) -> None:
        if self.original_agents and not self.force_primary:
            while not self.stop_event.is_set():
                alive = [
                    agent
                    for agent in self.original_agents
                    if pid_alive(int(agent["pid"]))
                ]
                if alive:
                    self.primary_state = {
                        "status": "EXTERNAL_PRIMARY_RUNNING",
                        "managed": False,
                        "provider": alive[0]["provider"],
                        "pid": alive[0]["pid"],
                        "external_agents": alive,
                    }
                    self.stop_event.wait(self.poll)
                    continue
                break

        while not self.stop_event.is_set():
            usable = self.providers.usable(primary=True)
            if not usable:
                self.primary_state = {
                    "status": "NO_WRITE_CAPABLE_PROVIDER",
                    "managed": False,
                }
                if self.stop_event.wait(900):
                    return
                self.providers.discover(probe=True)
                continue

            name = usable[0]
            prompt = (
                f"Read {self.paths.directive}. Continue the latest valid EUshop "
                "work from the current repository state. Preserve existing work, "
                "implement and validate the highest-value safe task, commit to the "
                "current non-protected branch when appropriate, and continue."
            )
            log = self.paths.logs / f"primary-{name}-{stamp()}.log"
            self.primary_state = {
                "status": "RUNNING",
                "managed": True,
                "provider": name,
                "started_at": now(),
            }
            code, output = run_capture(
                self.providers.command(name, prompt, resume=True),
                cwd=self.repo,
                timeout=self.task_timeout,
                env=self.providers.environment(name),
            )
            atomic_text(log, output)
            category = classify(code, output)
            self.primary_state.update(
                {
                    "status": "EXITED",
                    "exit_code": code,
                    "classification": category,
                    "last_log": str(log),
                    "ended_at": now(),
                }
            )
            if category in {
                "AUTHENTICATION_FAILED",
                "USAGE_LIMIT",
                "MODEL_UNAVAILABLE",
                "PROVIDER_NOT_CONFIGURED",
            }:
                self.providers.disable(name, category, last_line(output), output)
            if self.stop_event.wait(60):
                return

    def dashboard(self) -> None:
        state = read_json(self.paths.provider_state, {})
        providers = state.get("providers", {}) if isinstance(state, dict) else {}
        pending_count = len(self.store.files(self.paths.pending))
        running = self.store.running_tasks()
        lines = [
            "# EUshop AI Orchestrator Status",
            "",
            f"- Version: `{VERSION}`",
            f"- Updated: `{now()}`",
            f"- PID: `{os.getpid()}`",
            f"- Repository: `{self.repo}`",
            "",
            "## Primary lane",
            "",
        ]
        for key, value in self.primary_state.items():
            if key != "external_agents":
                lines.append(f"- {key}: `{value}`")
        lines.extend(
            [
                "",
                "## Queue",
                "",
                f"- Pending: `{pending_count}`",
                f"- Running: `{len(running)}`",
                f"- Done: `{len(self.store.files(self.paths.done))}`",
                f"- Failed: `{len(self.store.files(self.paths.failed))}`",
                "",
            ]
        )
        for task in running:
            lines.append(
                f"- **{task.get('title')}** — `{task.get('current_provider','')}` — "
                f"`{task.get('branch','')}`"
            )
        lines.extend(["", "## Providers", ""])
        for name in PROVIDER_ORDER:
            provider = providers.get(name, {})
            lines.append(
                f"- `{name}` — `{provider.get('health','UNKNOWN')}` — "
                f"auth `{provider.get('auth_status','UNKNOWN')}` — "
                f"probe `{provider.get('probe_status','NOT_RUN')}`"
            )
            if provider.get("cooldown_until"):
                lines.append(f"  - reset/cooldown: `{provider['cooldown_until']}`")
        lines.extend(
            [
                "",
                "## Safety",
                "",
                "- Existing AI processes are not killed.",
                "- Sidecars require a real write probe.",
                "- Sidecars use isolated worktrees and branches.",
                "- No automatic merge, deploy, force-push or destructive reset.",
                "",
            ]
        )
        atomic_text(self.paths.dashboard, "\n".join(lines))

    def run(self) -> int:
        self.acquire_lock()
        signal.signal(signal.SIGINT, self.signal)
        if hasattr(signal, "SIGTERM"):
            signal.signal(signal.SIGTERM, self.signal)
        with contextlib.suppress(OSError):
            self.paths.stop.unlink()

        try:
            info(f"EUshop orchestrator {VERSION}")
            info(
                "FCC-first provider mode: "
                + ", ".join(self.enabled_providers)
            )
            info("Running bounded real provider write probes...")
            providers = self.providers.discover(probe=True)
            usable = [
                name
                for name, provider in providers.items()
                if provider.available and provider.write_capable
            ]
            if usable:
                ok("Verified write-capable providers: " + ", ".join(usable))
            else:
                fail(
                    "No provider passed the write probe. Tasks will remain pending. "
                    "Run doctor and follow its provider actions."
                )

            if not self.no_defaults and not self.primary_only:
                seeded = self.store.seed_defaults()
                if seeded:
                    ok(f"Added {seeded} default tasks.")

            self.primary_thread = threading.Thread(
                target=self.primary_loop,
                name="EUshop-primary",
                daemon=True,
            )
            self.primary_thread.start()

            sidecar = Sidecar(
                self.paths,
                self.store,
                self.providers,
                self.task_timeout,
            )
            executor = concurrent.futures.ThreadPoolExecutor(
                max_workers=self.max_parallel,
                thread_name_prefix="EUshop-sidecar",
            )
            next_provider_refresh = time.monotonic() + 900

            while not self.stop_event.is_set():
                if self.paths.stop.exists():
                    warn("STOP file detected; no AI process will be forcibly terminated.")
                    self.stop_event.set()
                    break

                for future in [future for future in self.futures if future.done()]:
                    task = self.futures.pop(future)
                    try:
                        result = future.result()
                        if result.get("success"):
                            ok(
                                f"Task ready for review: {task['title']} "
                                f"({result.get('branch','')})"
                            )
                        elif not result.get("transient"):
                            warn(
                                f"Task blocked/failed: {task['title']}\n"
                                f"       {result.get('diagnostic','')}\n"
                                f"       log: {result.get('last_log','')}"
                            )
                    except Exception:
                        fail(
                            f"Uncaught sidecar error for {task.get('title')}\n"
                            + traceback.format_exc()
                        )

                if time.monotonic() >= next_provider_refresh and not self.providers.usable():
                    info("Rechecking providers...")
                    self.providers.discover(probe=True)
                    next_provider_refresh = time.monotonic() + 900

                if not self.primary_only and self.providers.usable():
                    active = list(self.futures.values())
                    capacity = self.max_parallel - len(active)
                    while capacity > 0:
                        task = self.store.next_task(active)
                        if task is None:
                            break
                        info(f"Starting sidecar: {task['title']}")
                        future = executor.submit(sidecar.run, task)
                        self.futures[future] = task
                        active.append(task)
                        capacity -= 1

                self.dashboard()
                self.stop_event.wait(self.poll)

            executor.shutdown(wait=False, cancel_futures=False)
            self.dashboard()
            warn("Supervisor stopped gracefully; existing agents were not killed.")
            return 0
        finally:
            self.release_lock()


def doctor(args: argparse.Namespace) -> int:
    repo = Path(args.repo).expanduser().resolve()
    ensure_repo(repo)
    paths = Paths.create(repo)
    manager = ProviderManager(
        paths,
        args.primary_provider,
        enabled_providers=args.providers,
        probe_timeout=args.probe_timeout,
    )
    providers = manager.discover(probe=not args.no_probe)
    print(f"EUshop AI doctor {VERSION}")
    print(f"Repository: {repo}\n")
    for name in PROVIDER_ORDER:
        provider = providers[name]
        print(f"{name:12} {provider.health:28} {provider.version or 'no version'}")
        print(f"{'':12} executable: {provider.executable or 'not found'}")
        print(f"{'':12} auth: {provider.auth_status}; probe: {provider.probe_status}")
        print(f"{'':12} detail: {provider.detail}")
        if provider.cooldown_until:
            print(f"{'':12} reset/cooldown: {provider.cooldown_until}")

    agents = running_agents()
    print("\nExact running agent executables:")
    if agents:
        for agent in agents:
            print(f"  PID {agent['pid']}: {agent['provider']} ({agent['name']})")
    else:
        print("  none")

    print()
    print("Selected providers: " + ", ".join(manager.enabled_providers))
    if "fcc-claude" in manager.enabled_providers or "fcc-codex" in manager.enabled_providers:
        state = read_json(paths.provider_state, {})
        fcc_state = state.get("fcc_server", {}) if isinstance(state, dict) else {}
        print(
            "FCC server: "
            + str(fcc_state.get("detail", "unknown"))
            + "; configure only keys/accounts you are authorized to use."
        )
        if not any(
            providers[name].health == "WRITE_CAPABLE"
            for name in ("fcc-claude", "fcc-codex")
        ):
            print(
                "FCC action: keep `fcc-server` running, open the local Admin UI "
                "(normally http://127.0.0.1:8082/admin), validate a provider/model, "
                "then rerun doctor."
            )
            print(f"FCC log: {paths.logs / 'fcc-server.log'}")
    if "hermes" in manager.enabled_providers and providers["hermes"].health in {
        "NO_TOOL_USE", "USAGE_LIMIT", "PROVIDER_NOT_CONFIGURED"
    }:
        print(
            "Hermes action: select a provider/model with remaining authorized quota "
            "or a local model, then rerun doctor."
        )
    if "codex" in manager.enabled_providers and providers["codex"].health == "USAGE_LIMIT":
        print("Direct Codex action: wait for reset or remove `codex` from --providers.")
    if "claude" in manager.enabled_providers and providers["claude"].health == "AUTHENTICATION_FAILED":
        print("Direct Claude action: authenticate it or remove `claude` from --providers.")
    print(f"State: {paths.provider_state}")
    return 0 if any(provider.available for provider in providers.values()) else 2


def add_task(args: argparse.Namespace) -> int:
    repo = Path(args.repo).expanduser().resolve()
    ensure_repo(repo)
    store = TaskStore(Paths.create(repo))
    prompt = (
        Path(args.prompt_file).read_text(encoding="utf-8-sig")
        if args.prompt_file
        else args.prompt
    )
    if not prompt:
        raise SystemExit("Provide --prompt or --prompt-file.")
    task = store.add(
        title=args.title,
        prompt=prompt,
        owned_paths=args.paths,
        priority=args.priority,
        providers=args.provider,
    )
    ok(f"Added task: {task['title']}")
    print(f"Task ID: {task['id']}")
    return 0


def status(args: argparse.Namespace) -> int:
    paths = Paths.create(Path(args.repo).expanduser().resolve())
    lock = read_json(paths.lock, {})
    pid = int(lock.get("pid") or 0) if isinstance(lock, dict) else 0
    lock_version = str(lock.get("version") or "") if isinstance(lock, dict) else ""
    print(
        paths.dashboard.read_text(encoding="utf-8-sig")
        if paths.dashboard.exists()
        else "No dashboard yet."
    )
    if not pid or not pid_alive(pid):
        print("\n[STALE] No live orchestrator owns this dashboard.")
    elif lock_version and lock_version != VERSION:
        print(
            f"\n[STALE VERSION] Live lock reports {lock_version}; "
            f"installed CLI is {VERSION}."
        )
    return 0


def stop(args: argparse.Namespace) -> int:
    paths = Paths.create(Path(args.repo).expanduser().resolve())
    atomic_text(paths.stop, f"Stop requested {now()}\n")
    ok("Graceful STOP file created. AI agents will not be forcibly terminated.")
    return 0


def retry_failed(args: argparse.Namespace) -> int:
    paths = Paths.create(Path(args.repo).expanduser().resolve())
    count = TaskStore(paths).retry_failed(args.reset_attempts)
    ok(f"Moved {count} failed task(s) to pending.")
    return 0


def recover_running(args: argparse.Namespace) -> int:
    paths = Paths.create(Path(args.repo).expanduser().resolve())
    lock = read_json(paths.lock, {})
    pid = int(lock.get("pid") or 0) if isinstance(lock, dict) else 0
    if pid and pid_alive(pid) and not args.force:
        fail(f"Orchestrator PID {pid} is still running.")
        return 2
    count = TaskStore(paths).recover_running(args.reset_attempts)
    ok(f"Recovered {count} running task(s) to pending.")
    return 0


def failures(args: argparse.Namespace) -> int:
    paths = Paths.create(Path(args.repo).expanduser().resolve())
    files = sorted(
        paths.results.glob("*.json"),
        key=lambda file: file.stat().st_mtime,
        reverse=True,
    )
    shown = 0
    for file in files:
        result = read_json(file)
        if not isinstance(result, dict) or result.get("success"):
            continue
        print(f"\n[{result.get('status','FAILED')}] {result.get('title',file.stem)}")
        print(f"Diagnostic: {result.get('diagnostic','No diagnostic')}")
        print(f"Log: {result.get('last_log','')}")
        shown += 1
        if shown >= args.limit:
            break
    if not shown:
        print("No recorded failures.")
    return 0


def selftest(_args: argparse.Namespace) -> int:
    assert slug("Hello EUshop") == "hello-eushop"
    assert "[REDACTED]" in redact("OPENAI_API_KEY=sk-abcdefghijklmnop")
    assert classify(1, "You've hit your usage limit") == "USAGE_LIMIT"
    assert classify(1, "The free quota has been exhausted") == "USAGE_LIMIT"
    assert TaskStore.overlap(["apps/web"], ["apps/web/pages"])
    assert not TaskStore.overlap(["apps/web"], ["services/core"])
    ok("Pure-Python self-test passed.")
    return 0


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description="EUshop continuous multi-agent supervisor.")
    root.add_argument("--repo", default=str(DEFAULT_REPO))
    commands = root.add_subparsers(dest="command", required=True)

    run = commands.add_parser("run")
    run.add_argument("--max-parallel", type=int, default=3)
    run.add_argument("--poll-seconds", type=int, default=15)
    run.add_argument("--task-timeout", type=int, default=7200)
    run.add_argument("--probe-timeout", type=int, default=90)
    run.add_argument(
        "--providers",
        nargs="+",
        choices=list(PROVIDER_ORDER),
        default=list(DEFAULT_PROVIDERS),
        help="Default: fcc-claude fcc-codex",
    )
    run.add_argument("--primary-provider", choices=["auto", *PROVIDER_ORDER], default="auto")
    run.add_argument("--primary-only", action="store_true")
    run.add_argument("--no-default-tasks", action="store_true")
    run.add_argument("--force-primary", action="store_true")
    run.set_defaults(func=lambda args: Orchestrator(args).run())

    check = commands.add_parser("doctor")
    check.add_argument("--probe-timeout", type=int, default=90)
    check.add_argument(
        "--providers",
        nargs="+",
        choices=list(PROVIDER_ORDER),
        default=list(DEFAULT_PROVIDERS),
        help="Default: fcc-claude fcc-codex",
    )
    check.add_argument("--primary-provider", choices=["auto", *PROVIDER_ORDER], default="auto")
    check.add_argument("--no-probe", action="store_true")
    check.set_defaults(func=doctor)

    add = commands.add_parser("add")
    add.add_argument("--title", required=True)
    add.add_argument("--prompt")
    add.add_argument("--prompt-file")
    add.add_argument("--paths", nargs="*", default=[])
    add.add_argument("--priority", type=int, default=100)
    add.add_argument("--provider", action="append", choices=list(PROVIDER_ORDER), default=[])
    add.set_defaults(func=add_task)

    show = commands.add_parser("status")
    show.set_defaults(func=status)

    halt = commands.add_parser("stop")
    halt.set_defaults(func=stop)

    retry = commands.add_parser("retry-failed")
    retry.add_argument("--reset-attempts", action="store_true")
    retry.set_defaults(func=retry_failed)

    recover = commands.add_parser("recover-running")
    recover.add_argument("--reset-attempts", action="store_true")
    recover.add_argument("--force", action="store_true")
    recover.set_defaults(func=recover_running)

    failed = commands.add_parser("failures")
    failed.add_argument("--limit", type=int, default=20)
    failed.set_defaults(func=failures)

    test = commands.add_parser("selftest")
    test.set_defaults(func=selftest)
    return root


def main() -> int:
    args = parser().parse_args()
    try:
        return int(args.func(args))
    except KeyboardInterrupt:
        warn("Interrupted; AI processes were not forcibly terminated.")
        return 130
    except SystemExit:
        raise
    except Exception as exc:
        fail(redact(f"{type(exc).__name__}: {exc}"))
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
