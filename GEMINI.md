# Registro de Cambios - CantaVerse (Assistant: Antigravity)

## Sesión: Implementación de Auto-Fetch y Mejoras de UX (v0.5.0)
**Fecha:** 2025-12-08

### Objetivos Alcanzados:
1.  **Automatización de Letras:** Se implementó `fetchLyricsLogic` con soporte de Puppeteer para `AZLyrics`.
2.  **Fallback Robusto:** Se añadió búsqueda en Google cuando la URL directa de AZLyrics falla (especialmente útil para canales "Topic" de YouTube).
3.  **Modo Vista Previa:** El backend ahora retorna `isPreview: true` en lugar de guardar automáticamente, permitiendo al usuario revisar antes de persistir.
4.  **UX de Herramienta de Sincronización:**
    - Botón "Buscar Letra Automática" explícito.
    - Eliminación de alertas intrusivas.
    - Sincronización de scroll (original vs traducción).
    - Persistencia correcta del nombre del artista (priorizando backend sobre título de YouTube).

### Archivos Clave Modificados:
- `api/fetch-lyrics.ts`: Lógica de scraping y Google fallback.
- `api/songs/[youtubeId].ts`: Lógica de vista previa y eliminación de auto-guardado.
- `api/utils/metadata.ts`: Limpieza de sufijo " - Topic".
- `src/pages/SyncToolPage.tsx`: Mejoras de UX y manejo de estado de metadatos.

### Notas para Futuras Sesiones:
- El scraping de AZLyrics depende de selectores DOM que podrían cambiar.
- La búsqueda de Google usa Puppeteer, lo cual es pesado pero efectivo. Monitorizar rendimiento.
