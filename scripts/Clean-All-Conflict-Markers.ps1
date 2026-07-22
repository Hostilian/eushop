# Strip conflict markers from any text file by taking the HEAD (ours) section
$files = Get-ChildItem -Path . -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\.git\\' -and $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\target\\' -and $_.FullName -notmatch '\\.next\\'
}

foreach ($f in $files) {
    try {
        $raw = [System.IO.File]::ReadAllText($f.FullName)
        if ($raw.Contains("<<<<<<<")) {
            Write-Host "Cleaning conflict markers in: $($f.FullName)"
            $lines = [System.IO.File]::ReadAllLines($f.FullName)
            $newLines = [System.Collections.Generic.List[string]]::new()
            $inConflict = $false
            $inOurs = $false

            foreach ($line in $lines) {
                if ($line.StartsWith("<<<<<<<")) {
                    $inConflict = $true
                    $inOurs = $true
                    continue
                }
                if ($line.StartsWith("=======")) {
                    $inOurs = $false
                    continue
                }
                if ($line.StartsWith(">>>>>>>")) {
                    $inConflict = $false
                    $inOurs = $false
                    continue
                }

                if (-not $inConflict) {
                    $newLines.Add($line)
                } elseif ($inOurs) {
                    $newLines.Add($line)
                }
            }

            [System.IO.File]::WriteAllLines($f.FullName, $newLines)
        }
    } catch {
        # Skip unreadable/locked files
    }
}
