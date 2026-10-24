$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'
try {
  # fresh login
  $r = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" `
    -Body '{"name":"Journal Tester","phone":"9999955555"}' -SessionVariable sess -UseBasicParsing
  $j = $r.Content | ConvertFrom-Json
  Invoke-WebRequest -Uri "http://localhost:3000/api/auth/verify" -Method POST -ContentType "application/json" `
    -Body ('{"phone":"9999955555","code":"' + $j.devOtp + '"}') -WebSession $sess -UseBasicParsing | Out-Null

  # set PIN — response cookie hc_journal is merged into $sess automatically
  $pin = Invoke-WebRequest -Uri "http://localhost:3000/api/journal/pin" -Method POST -ContentType "application/json" `
    -Body '{"pin":"4321"}' -WebSession $sess -UseBasicParsing
  Write-Output "pin-set: $($pin.Content)"

  # entries with journal cookie
  $e = Invoke-WebRequest -Uri "http://localhost:3000/api/journal/entries" -Method POST -ContentType "application/json" `
    -Body '{"op":"day","date":"2026-10-24T06:00:00.000Z","status":"sober","note":"felt good"}' -WebSession $sess -UseBasicParsing
  Write-Output "day-mark: $($e.StatusCode) $($e.Content)"

  $g = Invoke-WebRequest -Uri "http://localhost:3000/api/journal/entries" -WebSession $sess -UseBasicParsing
  $gj = $g.Content | ConvertFrom-Json
  Write-Output "entries-get: days=$($gj.days.Count) cravings=$($gj.cravings.Count) spend=$($gj.previousDailySpend)"

  # guest (no cookies at all) must be blocked
  try {
    Invoke-WebRequest -Uri "http://localhost:3000/api/journal/entries" -UseBasicParsing | Out-Null
    Write-Output "SECURITY FAIL: journal accessible to guests"
  } catch {
    Write-Output "journal-guest-blocked: $($_.Exception.Response.StatusCode.value__)"
  }
  Write-Output "JOURNAL_OK"
} catch {
  Write-Output "ERR: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Output $sr.ReadToEnd()
  }
}
