@echo off
setlocal EnableExtensions DisableDelayedExpansion
cd /d "%~dp0"
if errorlevel 1 exit /b 1
setlocal EnableDelayedExpansion
if not exist "package.json" (
    echo [ERROR] package.json is missing from the launcher directory.
    exit /b 1
)
title CatchTwo Autocatcher
color 0b
set "BRANCH=dev"

echo ============================================================
echo           CatchTwo Autocatcher - Boot Manager
echo ============================================================
echo.

:: 1. Check/Install Git Portable (MinGit)
where git >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%CD%\git\cmd\git.exe" (
        set "PATH=%CD%\git\cmd;%PATH%"
    ) else (
        echo [INFO] Git is not found on your system.
        echo [INFO] Downloading portable MinGit...
        curl --fail --location -o mingit.zip https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/MinGit-2.43.0-64-bit.zip
        if errorlevel 1 goto fatal
        set "EXPECTED_MINGIT_HASH=1905d93068e986258fafc69517df8fddff829bb2a289c1fa4dcc6cdf720ddf36"
        for /f %%H in ('powershell -NoProfile -Command "(Get-FileHash -Algorithm SHA256 -LiteralPath 'mingit.zip').Hash.ToLower()"') do set "ACTUAL_MINGIT_HASH=%%H"
        if /I not "!EXPECTED_MINGIT_HASH!"=="!ACTUAL_MINGIT_HASH!" (
            echo [ERROR] MinGit archive checksum verification failed.
            goto fatal
        )
        echo [INFO] Extracting Git...
        mkdir git >nul 2>nul
        tar -xf mingit.zip -C git
        if errorlevel 1 goto fatal
        del mingit.zip
        set "PATH=%CD%\git\cmd;%PATH%"
        echo [SUCCESS] Portable Git configured!
        echo.
    )
)

:: 2. Check/Install Node.js Portable
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%CD%\node\node.exe" (
        set "PATH=%CD%\node;%PATH%"
    ) else (
        echo [INFO] Node.js is not found on your system.
        set "NODE_VERSION=24.15.0"
        set "NODE_ARCHIVE=node-v!NODE_VERSION!-win-x64.zip"
        echo [INFO] Downloading portable Node.js v!NODE_VERSION!...
        curl --fail --location -o nodejs.zip https://nodejs.org/dist/v!NODE_VERSION!/!NODE_ARCHIVE!
        if errorlevel 1 goto fatal
        curl --fail --location -o node-shasums.txt https://nodejs.org/dist/v!NODE_VERSION!/SHASUMS256.txt
        if errorlevel 1 goto fatal

        set "EXPECTED_NODE_HASH="
        for /f "tokens=1" %%H in ('findstr /c:"  !NODE_ARCHIVE!" node-shasums.txt') do set "EXPECTED_NODE_HASH=%%H"
        for /f %%H in ('powershell -NoProfile -Command "(Get-FileHash -Algorithm SHA256 -LiteralPath 'nodejs.zip').Hash.ToLower()"') do set "ACTUAL_NODE_HASH=%%H"
        del node-shasums.txt
        if not defined EXPECTED_NODE_HASH (
            echo [ERROR] Could not find the Node.js archive checksum.
            goto fatal
        )
        if /I not "!EXPECTED_NODE_HASH!"=="!ACTUAL_NODE_HASH!" (
            echo [ERROR] Node.js archive checksum verification failed.
            goto fatal
        )

        echo [INFO] Extracting Node.js...
        tar -xf nodejs.zip
        if errorlevel 1 goto fatal
        rename node-v!NODE_VERSION!-win-x64 node
        if errorlevel 1 goto fatal
        del nodejs.zip
        set "PATH=%CD%\node;%PATH%"
        echo [SUCCESS] Portable Node.js configured!
        echo.
    )
)

:: 3. Auto Update from GitHub
where git >nul 2>nul
if %errorlevel% equ 0 (
    git rev-parse --is-inside-work-tree >nul 2>nul
    if errorlevel 1 (
        echo [WARNING] Not a git checkout. Skipping updates.
        echo.
        goto skip_update
    )
    echo [INFO] Checking for CatchTwo updates from GitHub...
    set "STASHED_CONFIG=0"
    rem Never reuse backups from an earlier run
    set "BACKED_UP=0"
    if exist config.js.bak del config.js.bak >nul
    if exist tokens.txt.bak del tokens.txt.bak >nul
    if exist config.js copy /Y config.js config.js.bak >nul
    if exist tokens.txt copy /Y tokens.txt tokens.txt.bak >nul
    if exist config.js set "BACKED_UP=1"
    if exist tokens.txt set "BACKED_UP=1"
    git diff --quiet -- config.js tokens.txt
    if errorlevel 1 (
        git stash push -m "catchtwo-config" -- config.js tokens.txt >nul 2>nul
        if errorlevel 1 goto update_failed
        set "STASHED_CONFIG=1"
    )
    echo [INFO] Switching to the !BRANCH! beta branch...
    git fetch origin !BRANCH!
    if errorlevel 1 goto update_soft_failed
    git checkout -B !BRANCH! origin/!BRANCH!
    if errorlevel 1 goto update_soft_failed
    if exist config.js copy /Y config.js config.js.new >nul
    if "!STASHED_CONFIG!"=="1" (
        git stash pop >nul 2>nul
        if errorlevel 1 goto update_failed
    )
    if exist config.js.new if exist config.js (
        node scripts/mergeConfig.js config.js.new config.js
        if errorlevel 1 goto update_failed
    )
    if exist config.js.new del config.js.new >nul
    if exist config.js.bak del config.js.bak >nul
    if exist tokens.txt.bak del tokens.txt.bak >nul
    echo [SUCCESS] Update check completed.
    echo.
) else (
    echo [WARNING] Git not active. Skipping updates.
    echo.
)
:skip_update

:: 4. Verify & Install dependencies
echo [INFO] Checking package dependencies...
if not exist "package.json" (
    echo [ERROR] package.json is missing! Please run this script in the root directory of CatchTwo.
    pause
    exit /b
)
call npm install --omit=dev --no-audit --no-fund
if errorlevel 1 goto fatal
echo [SUCCESS] Dependencies verified.

echo.
echo ============================================================
echo   CatchTwo is starting now...
echo ============================================================
echo.

:loop
node index.js

if %errorlevel% equ 2 (
    echo.
    echo [ERROR] Invalid configuration. Fix config.js or tokens.txt, then start again.
    pause
    exit /b 2
)
if %errorlevel% equ 0 goto loop

echo.
echo ============================================================
echo   CatchTwo crashed or exited with code %errorlevel%.
echo   Restarting in 10 seconds...
echo ============================================================
timeout /t 10
goto loop

:update_failed
echo [ERROR] Update failed. Restoring local configuration backups.
if "!STASHED_CONFIG!"=="1" git stash pop >nul 2>nul
if "!BACKED_UP!"=="1" (
    if exist config.js.bak copy /Y config.js.bak config.js >nul
    if exist tokens.txt.bak copy /Y tokens.txt.bak tokens.txt >nul
)
if exist config.js.new del config.js.new >nul
if exist config.js.bak del config.js.bak >nul
if exist tokens.txt.bak del tokens.txt.bak >nul
exit /b 1

:update_soft_failed
echo [WARNING] Update check failed. Starting the current version.
if "!STASHED_CONFIG!"=="1" git stash pop >nul 2>nul
if exist config.js.new del config.js.new >nul
if exist config.js.bak del config.js.bak >nul
if exist tokens.txt.bak del tokens.txt.bak >nul
goto skip_update

:fatal
echo [ERROR] CatchTwo setup failed. See the error above for details.
exit /b 1
