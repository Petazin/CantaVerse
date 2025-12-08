# Registro de Cambios - CantaVerse (Assistant: Antigravity)

## Sesión: Pulido Final de UX y Sanitización de Datos (v0.5.2)
**Fecha:** 2025-12-08

### Cambios Realizados:
1.  **Sanitización de Datos (Backend/Frontend):**
    - Se corrigió la lógica que duplicaba el nombre del artista en el título de la canción.
    - Implementación "quirúrgica" que solo elimina el artista si hay un separador explícito, protegiendo nombres repetitivos (Duran Duran).
    - Refuerzo en el endpoint `POST` para limpiar datos sucios antes de guardar.
2.  **Mejoras Visuales (SyncTool):**
    - **Panel de confirmación:** Nuevo bloque compacto alineado horizontalmente con el título.
    - **Sticky Footer:** La botonera de acciones ("Traducir", "Marcar", "Guardar") ahora se mantiene fija al pie del panel, mientras que el contenido superior (Video, Letra) tiene su propio scroll.
    - **Estilos:** Unificación completa con el tema oscuro de la aplicación.

### Archivos Modificados:
- `api/utils/metadata.ts`: Lógica de extracción mejorada.
- `api/songs/index.ts`: Middleware de limpieza en guardado.
- `api/songs/[youtubeId].ts`: Respuesta de API optimizada.
- `src/pages/SyncToolPage.tsx`: Refactorización de UI (Sticky Layout, Grid).
- `src/styles/index.css`: Ajuste de scrolling en contenedores flex.
