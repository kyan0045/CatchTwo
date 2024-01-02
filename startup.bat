@echo off

IF NOT EXIST .git (
    git init
    git remote add origin https://github.com/kyan0045/catchtwo.git
)

git fetch origin

git branch | findstr /c:"main" >nul
IF %ERRORLEVEL% NEQ 0 (
    git checkout -b main origin/main
) ELSE (
    git switch main
    git pull origin main
)

call npm i

call node index.js

pause
