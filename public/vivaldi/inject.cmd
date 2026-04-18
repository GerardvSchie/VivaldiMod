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

REM Important! Use /b option to copy it over as a binary, otherwise line endings will be messed up
if not exist "%latestVersionFolder%\window.bak.html" (
	echo Creating a backup of your original window.html file.
	copy /b "%latestVersionFolder%\window.html" "%latestVersionFolder%\window.bak.html"
)

echo copying css and js files to custom.js and custom.css
copy /b *.css "%latestVersionFolder%\custom.css" > NUL
copy /b *.js "%latestVersionFolder%\custom.js" > NUL

echo patching window.html file

@REM Needed to acess a variable in the loop
SETLOCAL enabledelayedexpansion
>"%latestVersionFolder%\window.html" (
  for /f "delims=" %%A in ('type "%latestVersionFolder%\window.bak.html"') do (
    set /a "lineNumber+=1"
    @REM IMPORTANT: This defer will prevent the script from being executed too early
    @REM If it is executed too early a second browser window will show grey and never start
    if !lineNumber! equ 7 (
      echo   ^<script defer src="custom.js"^>^</script^>
    ) else if !lineNumber! equ 9 (
      echo   ^<link rel="stylesheet" href="custom.css" /^>
    )

    @REM Otherwise the ! in the original file will be ignored
    setlocal disabledelayedexpansion
    echo %%A
    endlocal
  )
)

cd %INITIAL_PATH%