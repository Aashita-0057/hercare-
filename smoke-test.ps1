$ProgressPreference = 'SilentlyContinue'
$ErrorActionPreference = 'Stop'
try {
  $r = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" `
    -Body '{"name":"Test User 2","phone":"9999977777"}' -SessionVariable sess -UseBasicParsing
  $j = $r.Content | ConvertFrom-Json
  Write-Output "register: devMode=$($j.devMode)"

  $v = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/verify" -Method POST -ContentType "application/json" `
    -Body ('{"phone":"9999977777","code":"' + $j.devOtp + '"}') -WebSession $sess -UseBasicParsing
  Write-Output "verify: $($v.StatusCode)"

  $per = Invoke-WebRequest -Uri "http://localhost:3000/api/periods" -Method POST -ContentType "application/json" `
    -Body '{"startDate":"2026-09-05","endDate":"2026-09-09","symptoms":["Cramps"],"notes":"test"}' -WebSession $sess -UseBasicParsing
  Write-Output "periods-save: $($per.StatusCode) $($per.Content)"

  $g = Invoke-WebRequest -Uri "http://localhost:3000/api/periods" -WebSession $sess -UseBasicParsing
  $gj = $g.Content | ConvertFrom-Json
  Write-Output "periods-get: $($gj.logs.Count) logs"

  $he = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method POST -ContentType "application/json" `
    -Body '{"symptoms":["breathing","joint_pain"]}' -WebSession $sess -UseBasicParsing
  $hj = $he.Content | ConvertFrom-Json
  Write-Output "triage: level=$($hj.level)"

  $pg = Invoke-WebRequest -Uri "http://localhost:3000/api/pregnancy" -WebSession $sess -UseBasicParsing
  Write-Output "pregnancy: $($pg.StatusCode)"

  $pp = Invoke-WebRequest -Uri "http://localhost:3000/api/pregnancy" -Method POST -ContentType "application/json" `
    -Body '{"action":"profile","eddDate":"2026-12-20","status":"antenatal"}' -WebSession $sess -UseBasicParsing
  Write-Output "pregnancy-profile: $($pp.Content)"

  $rp = Invoke-WebRequest -Uri "http://localhost:3000/api/report" -Method POST -ContentType "application/json" `
    -Body '{"category":"harassment","description":"Someone followed me near the bus stand last evening.","consented":true}' -UseBasicParsing
  $rj = $rp.Content | ConvertFrom-Json
  Write-Output "report(guest): ref=$($rj.reference) linked=$($rj.linked)"

  $st = Invoke-WebRequest -Uri "http://localhost:3000/api/stories" -UseBasicParsing
  Write-Output "stories: $((($st.Content | ConvertFrom-Json).stories).Count)"

  # page smoke tests
  foreach ($path in @("/home","/language","/doctors","/awareness","/safety","/safety/report","/safety/nearby","/dashboard","/dashboard/periods","/dashboard/pregnancy","/dashboard/elder","/journal","/profile","/search?q=iron","/neutral")) {
    $p = Invoke-WebRequest -Uri ("http://localhost:3000" + $path) -UseBasicParsing -WebSession $sess
    Write-Output ("page {0} -> {1}" -f $path, $p.StatusCode)
  }
  Write-Output "ALL_OK"
} catch {
  Write-Output "ERR: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Output $sr.ReadToEnd()
  }
}
