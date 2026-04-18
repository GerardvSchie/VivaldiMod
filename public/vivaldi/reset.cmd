:: Author: debiedowner

@echo off

set "INITIAL_PATH=%cd%"

REM make current directory work when run as administrator
cd /d "%~dp0"

set installPath="%USERPROFILE%\AppData\Local\Vivaldi\Application"
echo Searching at: %installPath%
for /f "tokens=*" %%a in ('dir /a:-d /b /s %installPath%') do (
	if "%%~nxa"=="window.html" set latestVersionFolder=%%~dpa
)

if "%latestVersionFolder%"=="" (
	pause & exit
) else (
	echo Found latest version folder: "%latestVersionFolder%"
)

if not exist "%latestVersionFolder%\window.bak.html" (
	echo Creating a backup of your original window.html file.
	copy /b "%latestVersionFolder%\window.html" "%latestVersionFolder%\window.bak.html"
)

copy /b "%latestVersionFolder%\window.bak.html" "%latestVersionFolder%\window.html"

cd %INITIAL_PATH%

@REM pause