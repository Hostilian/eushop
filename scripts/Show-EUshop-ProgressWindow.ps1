#Requires -Version 5.1
<#
.SYNOPSIS
    Native Windows EUshop AI Progress Monitor GUI (WinForms/WPF Window)
.DESCRIPTION
    Floating Always-on-Top GUI window displaying live task completion, visual green/red status indicator, and progress bar.
#>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$RepoPath = "D:\CODING\eushop"
$QueueFile = Join-Path $RepoPath ".hermes\yc-optimization-queue.md"
$LockFile = Join-Path $RepoPath ".claude\AGENT_FAILOVER.lock"
$WdLock = Join-Path $RepoPath ".agent-state\watchdog.pid"

# ---- Form Creation ----
$form = New-Object System.Windows.Forms.Form
$form.Text = "EUshop AI Progress Monitor"
$form.Size = New-Object System.Drawing.Size(420, 340)
$form.StartPosition = [System.Windows.Forms.FormStartPosition]::CenterScreen
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::FixedSingle
$form.MaximizeBox = $false
$form.TopMost = $true
$form.BackColor = [System.Drawing.Color]::FromArgb(24, 28, 36)

# ---- Title Label ----
$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = "EUshop AI Mission Monitor"
$lblTitle.Font = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
$lblTitle.ForeColor = [System.Drawing.Color]::FromArgb(240, 240, 240)
$lblTitle.Location = New-Object System.Drawing.Point(15, 12)
$lblTitle.AutoSize = $true
$form.Controls.Add($lblTitle)

# ---- Status Indicator Badge ----
$badgeStatus = New-Object System.Windows.Forms.Label
$badgeStatus.Text = "  SYSTEM HEALTHY  "
$badgeStatus.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Bold)
$badgeStatus.ForeColor = [System.Drawing.Color]::White
$badgeStatus.BackColor = [System.Drawing.Color]::FromArgb(40, 167, 69) # Green
$badgeStatus.Location = New-Object System.Drawing.Point(260, 15)
$badgeStatus.Size = New-Object System.Drawing.Size(130, 24)
$badgeStatus.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$form.Controls.Add($badgeStatus)

# ---- Progress Bar ----
$progressBar = New-Object System.Windows.Forms.ProgressBar
$progressBar.Location = New-Object System.Drawing.Point(18, 55)
$progressBar.Size = New-Object System.Drawing.Size(370, 28)
$progressBar.Minimum = 0
$progressBar.Maximum = 100
$progressBar.Value = 0
$form.Controls.Add($progressBar)

# ---- Percentage Label ----
$lblPercent = New-Object System.Windows.Forms.Label
$lblPercent.Text = "Progress: 0% (0 / 0 Tasks)"
$lblPercent.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold)
$lblPercent.ForeColor = [System.Drawing.Color]::FromArgb(255, 193, 7) # Yellow
$lblPercent.Location = New-Object System.Drawing.Point(15, 92)
$lblPercent.Size = New-Object System.Drawing.Size(370, 25)
$form.Controls.Add($lblPercent)

# ---- Details Box ----
$txtDetails = New-Object System.Windows.Forms.TextBox
$txtDetails.Multiline = $true
$txtDetails.ReadOnly = $true
$txtDetails.ScrollBars = [System.Windows.Forms.ScrollBars]::Vertical
$txtDetails.Location = New-Object System.Drawing.Point(18, 125)
$txtDetails.Size = New-Object System.Drawing.Size(370, 130)
$txtDetails.BackColor = [System.Drawing.Color]::FromArgb(15, 18, 24)
$txtDetails.ForeColor = [System.Drawing.Color]::FromArgb(200, 225, 255)
$txtDetails.Font = New-Object System.Drawing.Font("Consolas", 9.5)
$form.Controls.Add($txtDetails)

# ---- Footer Refresh Label ----
$lblFooter = New-Object System.Windows.Forms.Label
$lblFooter.Text = "Auto-refreshing every 3s... (Always-on-Top Enabled)"
$lblFooter.Font = New-Object System.Drawing.Font("Segoe UI", 8, [System.Drawing.FontStyle]::Italic)
$lblFooter.ForeColor = [System.Drawing.Color]::FromArgb(140, 150, 165)
$lblFooter.Location = New-Object System.Drawing.Point(18, 265)
$lblFooter.AutoSize = $true
$form.Controls.Add($lblFooter)

# ---- Refresh Function ----
function Update-MonitorData {
    $total = 0
    $completed = 0
    $branch = (git -C $RepoPath branch --show-current 2>$null).Trim()

    if (Test-Path $QueueFile) {
        $lines = Get-Content $QueueFile -Encoding UTF8 -ErrorAction SilentlyContinue
        foreach ($line in $lines) {
            if ($line -match '^\s*-\s*\[([x /!])\]\s+TASK\s+(\d+)\s*(?:[—\-:\s])\s*(.*)$') {
                $total++
                if ($Matches[1] -eq 'x') { $completed++ }
            }
        }
    }

    if ($total -eq 0) { $total = 136 }
    $pct = [math]::Round(($completed / $total) * 100, 1)

    $progressBar.Value = [math]::Min([int]$pct, 100)
    $lblPercent.Text = "Progress: $pct% ($completed / $total Tasks Completed)"

    # Check health (Orchestrator or Watchdog PID alive)
    $orchPid = if (Test-Path $LockFile) { Get-Content $LockFile -Raw -ErrorAction SilentlyContinue } else { $null }
    $orchAlive = if ($orchPid) { $null -ne (Get-Process -Id ([int]$orchPid) -ErrorAction SilentlyContinue) } else { $false }

    $wdPid = if (Test-Path $WdLock) { Get-Content $WdLock -Raw -ErrorAction SilentlyContinue } else { $null }
    $wdAlive = if ($wdPid) { $null -ne (Get-Process -Id ([int]$wdPid) -ErrorAction SilentlyContinue) } else { $false }

    if ($orchAlive -or $wdAlive) {
        $badgeStatus.Text = "  SYSTEM ONLINE  "
        $badgeStatus.BackColor = [System.Drawing.Color]::FromArgb(40, 167, 69) # Green
    } else {
        $badgeStatus.Text = "  RUNNER PAUSED  "
        $badgeStatus.BackColor = [System.Drawing.Color]::FromArgb(220, 53, 69) # Red
    }

    $details = @(
        "Branch       : $branch",
        "Orchestrator : $(if ($orchAlive) { "RUNNING (PID $orchPid)" } else { "STOPPED" })",
        "Watchdog     : $(if ($wdAlive) { "RUNNING (PID $wdPid)" } else { "STOPPED" })",
        "Last Check   : $(Get-Date -Format 'HH:mm:ss')",
        "----------------------------------------",
        "Next Focus   : Phase 26/27 Security & CodeQL"
    ) -join "`r`n"

    $txtDetails.Text = $details
}

# ---- Timer Setup ----
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 3000 # 3 seconds
$timer.Add_Tick({ Update-MonitorData })

$form.Add_Shown({
    Update-MonitorData
    $timer.Start()
})

$form.Add_FormClosed({
    $timer.Stop()
})

# Show Form
[void]$form.ShowDialog()
