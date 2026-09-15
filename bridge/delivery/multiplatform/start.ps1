param([switch]$Verify,[switch]$Connection)
$ErrorActionPreference = 'Stop'
$Node = Join-Path $PSScriptRoot 'node/node-v24.15.0-win-x64/node.exe'
$Launch = Join-Path $PSScriptRoot 'launch.mjs'
if ($Verify) { & $Node $Launch --verify }
elseif ($Connection) { & $Node $Launch --connection }
else { & $Node $Launch }
exit $LASTEXITCODE
