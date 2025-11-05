# Configuración de Cookies de YouTube

## ¿Por qué necesito esto?

Algunos videos de YouTube tienen **restricción de edad** y requieren que estés autenticado para reproducirlos. Cuando el bot encuentra este tipo de videos, mostrará este mensaje:

```
⚠️ Video con restricción de edad saltado:
"[Nombre del video]"

Este video requiere autenticación de YouTube. Configurando cookies se puede reproducir.
```

## Soluciones

### Opción 1: Evitar videos con restricción de edad (Recomendado)

La forma más simple es **evitar agregar videos con restricción de edad** a la cola. El bot automáticamente:
- ✅ Detecta estos videos
- ✅ Los salta automáticamente
- ✅ Muestra un mensaje explicativo
- ✅ Continúa con la siguiente canción

**No requiere configuración adicional.**

---

### Opción 2: Configurar cookies de YouTube (Avanzado)

Si **realmente necesitas** reproducir videos con restricción de edad, puedes configurar cookies de tu cuenta de YouTube.

#### Pasos:

1. **Instalar extensión de navegador:**
   - Chrome/Edge: [Get cookies.txt LOCALLY](https://chrome.google.com/webstore/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
   - Firefox: [cookies.txt](https://addons.mozilla.org/en-US/firefox/addon/cookies-txt/)

2. **Exportar cookies de YouTube:**
   - Ve a [youtube.com](https://youtube.com)
   - Asegúrate de estar **autenticado** con tu cuenta
   - Haz click en la extensión
   - Exporta las cookies como `youtube.com_cookies.txt`

3. **Mover archivo de cookies:**
   ```bash
   # Windows
   move youtube.com_cookies.txt C:\Users\fiae\bot-youtube-discord-local-streaming\cookies.txt

   # Linux/Mac
   mv youtube.com_cookies.txt ./cookies.txt
   ```

4. **Actualizar código del bot:**

   Edita `src/services/YouTubeService.ts` en la función `getAudioStream()`:

   ```typescript
   // Línea 163 - Agregar opción de cookies
   const stream = ytdl.exec(url, {
     output: '-',
     format: 'bestaudio',
     extractAudio: true,
     audioFormat: 'opus',
     noCheckCertificates: true,
     noWarnings: true,
     preferFreeFormats: true,
     cookies: './cookies.txt', // 👈 AGREGAR ESTA LÍNEA
     addHeader: [
       'referer:youtube.com',
       'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
     ]
   });
   ```

5. **Reconstruir el bot:**
   ```bash
   npm run build
   npm run dev
   ```

---

## Advertencias ⚠️

### Seguridad:
- ❌ **NUNCA** compartas tu archivo `cookies.txt` con nadie
- ❌ **NUNCA** subas `cookies.txt` a GitHub u otros repositorios públicos
- ✅ Agrega `cookies.txt` a `.gitignore`

### Mantenimiento:
- 🔄 Las cookies **expiran** después de ~6 meses
- 🔄 Tendrás que **renovarlas** periódicamente
- 🔄 Si cambias tu contraseña de YouTube, las cookies se **invalidan**

### Privacidad:
- ⚠️ Dar acceso a tus cookies de YouTube da acceso a tu cuenta
- ⚠️ Solo usa esta opción en bots **privados** que solo tú uses

---

## Agregar cookies.txt a .gitignore

Para evitar subir accidentalmente tus cookies:

```bash
# Editar .gitignore
echo "cookies.txt" >> .gitignore
echo "*.cookies" >> .gitignore
```

---

## Alternativas

### 1. Usar videos sin restricción
La mayoría de la música está disponible en versiones sin restricción de edad.

### 2. Buscar versiones alternativas
```bash
# En lugar de:
!play https://youtube.com/watch?v=VIDEO_RESTRINGIDO

# Buscar por nombre:
!play nombre de la canción

# El bot encontrará la primera coincidencia (usualmente sin restricción)
```

---

## Troubleshooting

### ❌ "Las cookies no funcionan"

**Causa:** Las cookies pueden haber expirado.

**Solución:**
1. Borra `cookies.txt`
2. Cierra sesión en YouTube
3. Vuelve a iniciar sesión
4. Exporta nuevas cookies

### ❌ "Sigue mostrando error de restricción de edad"

**Causa:** El formato de cookies puede estar incorrecto.

**Solución:**
1. Verifica que el archivo sea `cookies.txt` (no `.txt.txt`)
2. Verifica que la ruta en el código sea correcta
3. Verifica que el archivo tenga contenido (no esté vacío)

### ❌ "Error al leer cookies"

**Causa:** Permisos del archivo.

**Solución Windows:**
```bash
icacls cookies.txt /grant Everyone:R
```

**Solución Linux/Mac:**
```bash
chmod 644 cookies.txt
```

---

## Recursos

- [yt-dlp FAQ: Cookies](https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp)
- [yt-dlp: Exporting YouTube Cookies](https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies)

---

**Última actualización:** 2025-11-04
**Versión del bot:** v3.0
