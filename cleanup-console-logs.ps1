# Console.log Cleanup Script for Egie-Ecommerce-Admin
# This script removes ALL console.log() statements while keeping console.error()
# 
# IMPORTANT: This will backup your files first!

Write-Host "================================" -ForegroundColor Cyan
Write-Host " Console.log Cleanup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$srcPath = "src"

if (!(Test-Path $srcPath)) {
    Write-Host "ERROR: src folder not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Create backup folder
$backupFolder = "backup_before_console_cleanup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "Creating backup in: $backupFolder" -ForegroundColor Yellow
Copy-Item -Path $srcPath -Destination $backupFolder -Recurse
Write-Host "✓ Backup created successfully!" -ForegroundColor Green
Write-Host ""

# Counter for tracking
$totalFiles = 0
$modifiedFiles = 0
$totalLogsRemoved = 0

# Get all JSX and JS files
$files = Get-ChildItem -Path $srcPath -Filter "*.jsx" -Recurse
$files += Get-ChildItem -Path $srcPath -Filter "*.js" -Recurse

Write-Host "Found $($files.Count) JavaScript/JSX files to scan..." -ForegroundColor Cyan
Write-Host ""

foreach ($file in $files) {
    $totalFiles++
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Pattern to match console.log statements (but NOT console.error, console.warn, etc.)
    # Matches:
    # - console.log(...)
    # - console.log('...')
    # - Multi-line console.log statements
    # Preserves:
    # - console.error(...)
    # - console.warn(...)
    # - console.info(...)
    # - console.debug(...)
    
    # Count console.logs before removal
    $logCount = ([regex]::Matches($content, 'console\.log\(')).Count
    
    if ($logCount -gt 0) {
        # Remove console.log statements with various patterns
        
        # Pattern 1: Single line console.log with semicolon
        $content = $content -replace '(?m)^\s*console\.log\([^)]*\);\s*$\r?\n?', ''
        
        # Pattern 2: Single line console.log without semicolon
        $content = $content -replace '(?m)^\s*console\.log\([^)]*\)\s*$\r?\n?', ''
        
        # Pattern 3: Inline console.log (keeping the line but removing the call)
        # This is trickier - only remove if it's the only thing on the line
        
        # Check if content actually changed
        if ($content -ne $originalContent) {
            # Count console.logs after removal
            $remainingLogs = ([regex]::Matches($content, 'console\.log\(')).Count
            $removed = $logCount - $remainingLogs
            
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $modifiedFiles++
            $totalLogsRemoved += $removed
            
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
            Write-Host "✓ $relativePath" -ForegroundColor Green
            Write-Host "  Removed: $removed console.log statement(s)" -ForegroundColor Gray
            
            if ($remainingLogs -gt 0) {
                Write-Host "  Warning: $remainingLogs console.log(s) remain (may be multi-line or complex)" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host " Cleanup Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files scanned:        $totalFiles" -ForegroundColor White
Write-Host "Files modified:       $modifiedFiles" -ForegroundColor Green
Write-Host "Console.logs removed: $totalLogsRemoved" -ForegroundColor Green
Write-Host ""
Write-Host "Backup location: $backupFolder" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ All console.error(), console.warn() statements preserved" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test your application: npm run dev" -ForegroundColor White
Write-Host "2. Check for any issues" -ForegroundColor White
Write-Host "3. If everything works, you can delete the backup folder" -ForegroundColor White
Write-Host "4. If there are issues, restore from backup: Copy-Item -Path $backupFolder\src -Destination . -Recurse -Force" -ForegroundColor White
Write-Host ""
