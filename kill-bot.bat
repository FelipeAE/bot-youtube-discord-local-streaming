@echo off
echo Buscando proceso del bot...

REM Verificar si existe el archivo .bot.pid
if not exist ".bot.pid" (
    echo [ERROR] No se encontro el archivo .bot.pid
    echo El bot no esta corriendo o se inicio sin guardar el PID.
    echo.
    echo Si quieres matar TODOS los procesos de Node.js, presiona cualquier tecla.
    echo ADVERTENCIA: Esto matara el proceso de Claude tambien!
    pause >nul
    echo.
    echo Matando TODOS los procesos de Node.js...
    taskkill /F /IM node.exe 2>nul
    goto END
)

REM Leer el PID del archivo
set /p BOT_PID=<.bot.pid
echo PID del bot encontrado: %BOT_PID%

REM Matar el proceso específico
echo Matando proceso %BOT_PID%...
taskkill /F /PID %BOT_PID% 2>nul

REM Siempre eliminar el archivo PID después de intentar matar el proceso
if exist ".bot.pid" (
    del .bot.pid 2>nul
    echo Archivo .bot.pid eliminado.
    echo Bot terminado (PID: %BOT_PID%).
) else (
    echo Archivo .bot.pid ya no existe.
)

:END
timeout /t 2 /nobreak >nul
echo Listo!
