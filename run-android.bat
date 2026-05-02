@echo off
echo ========================================
echo   SecurePeople - Lanzador Android
echo ========================================
echo.

:: Configurar variables de entorno
set JAVA_HOME=C:\Program Files\Java\jdk-21.0.10
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%ANDROID_HOME%\cmdline-tools\latest\bin;%PATH%

echo [1/4] Verificando herramientas...
where adb >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] adb no encontrado en: %ANDROID_HOME%\platform-tools
    echo Verifica que Android SDK este instalado correctamente.
    pause & exit /b 1
)
echo       adb: OK

:: Verificar NDK
if not exist "%ANDROID_HOME%\ndk\25.1.8937393" (
    echo.
    echo [ERROR] NDK 25.1.8937393 no encontrado.
    echo Instala el NDK desde Android Studio:
    echo   Tools ^> SDK Manager ^> SDK Tools ^> NDK (Side by side) ^> 25.1.8937393
    echo.
    pause & exit /b 1
)
echo       NDK: OK

echo.
echo [2/4] Verificando emulador...
set DEVICE_FOUND=0
for /f "tokens=*" %%d in ('adb devices ^| findstr /v "List"') do (
    if not "%%d"=="" set DEVICE_FOUND=1
)

if %DEVICE_FOUND%==0 (
    echo       Ningun dispositivo conectado. Iniciando emulador...
    for /f "tokens=*" %%i in ('emulator -list-avds 2^>nul') do (
        echo       Iniciando: %%i
        start "" "%ANDROID_HOME%\emulator\emulator.exe" -avd %%i -no-snapshot-load
        echo       Esperando 35 segundos...
        timeout /t 35 /nobreak >nul
        goto :device_ready
    )
    echo [ERROR] No hay emuladores AVD creados.
    echo Crea uno en Android Studio: Tools ^> AVD Manager
    pause & exit /b 1
) else (
    echo       Dispositivo detectado: OK
)

:device_ready
echo.
echo [3/4] Iniciando backend (nueva ventana)...
start "SecurePeople Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Compilando e instalando app...
cd /d "%~dp0frontend"
call npm run android

echo.
echo ========================================
echo   Proceso completado
echo ========================================
pause
