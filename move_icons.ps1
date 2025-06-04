# Get the Downloads folder path
$downloadsPath = [Environment]::GetFolderPath("UserProfile") + "\Downloads"

# Get the extension directory path
$extensionPath = $PSScriptRoot

# Move the icon files
Move-Item -Path "$downloadsPath\icon16.png" -Destination "$extensionPath\icons\icon16.png" -Force
Move-Item -Path "$downloadsPath\icon48.png" -Destination "$extensionPath\icons\icon48.png" -Force
Move-Item -Path "$downloadsPath\icon128.png" -Destination "$extensionPath\icons\icon128.png" -Force

Write-Host "Icons have been moved to the icons folder." 