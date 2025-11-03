#!/bin/bash

echo "Buscando proceso del bot..."

# Verificar si existe el archivo .bot.pid
if [ ! -f ".bot.pid" ]; then
    echo "[ERROR] No se encontró el archivo .bot.pid"
    echo "El bot no está corriendo o se inició sin guardar el PID."
    echo ""
    read -p "¿Quieres matar TODOS los procesos de Node.js? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "ADVERTENCIA: Esto matará Claude Code también!"
        echo "Matando TODOS los procesos de Node.js..."
        taskkill //F //IM node.exe 2>/dev/null || echo "No se encontraron procesos Node.js"
    fi
    exit 1
fi

# Leer el PID del archivo
BOT_PID=$(cat .bot.pid)
echo "PID del bot encontrado: $BOT_PID"

# Matar el proceso específico
echo "Matando proceso $BOT_PID..."
taskkill //F //PID "$BOT_PID" 2>/dev/null

# Siempre eliminar el archivo PID
if [ -f ".bot.pid" ]; then
    rm -f .bot.pid
    echo "Archivo .bot.pid eliminado."
    echo "Bot terminado (PID: $BOT_PID)."
else
    echo "Archivo .bot.pid ya no existe."
fi

echo "¡Listo!"
sleep 2
