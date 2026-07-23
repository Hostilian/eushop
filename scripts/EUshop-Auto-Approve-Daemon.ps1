# EUshop Autonomous Auto-Approve & Keypress Daemon
# Runs in the background during user absence, auto-selecting '1' or 'Enter' for any interactive prompts.

param(
    [int]$IntervalSeconds = 5
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;

public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
}
"@

Write-Host "[AUTO-APPROVE] Autonomous prompt auto-responder started. Polling every $IntervalSeconds seconds..."

while ($true) {
    try {
        # Find terminal processes matching node, claude, or powershell running fcc-claude
        $procs = Get-Process -Name "powershell", "cmd", "node", "claude" -ErrorAction SilentlyContinue

        foreach ($p in $procs) {
            if ($p.MainWindowHandle -ne [IntPtr]::Zero) {
                $title = $p.MainWindowTitle
                if ($title -match "fcc-claude" -or $title -match "eushop" -or $title -match "Administrator") {
                    # Send Enter and 1 to prevent interactive menu stalls
                    [System.Windows.Forms.SendKeys]::SendWait("1{ENTER}")
                    [System.Windows.Forms.SendKeys]::SendWait("~")
                }
            }
        }
    }
    catch {
        # Ignore minor desktop focus exceptions
    }

    Start-Sleep -Seconds $IntervalSeconds
}
