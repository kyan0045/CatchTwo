@echo off

:: Run CatchTwo
@echo off
echo Starting CatchTwo...
:loop
node index.js --no-deprecation
if %errorlevel% equ 0 goto loop
echo CatchTwo crashed with exit code %errorlevel%. Restarting...
timeout /t 30
goto loop

pause