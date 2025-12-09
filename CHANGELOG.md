# Changelog

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Próximos Cambios
- Implementación de un sistema de persistencia de datos (base de datos).
- Rediseño estético general de la interfaz.

### Security
- Se han actualizado las dependencias para resolver 4 vulnerabilidades (2 altas, 2 moderadas) reportadas por `npm audit`. Se utilizó la propiedad `overrides` de `package.json` para forzar versiones seguras de `esbuild`, `path-to-regexp` y `undici`.

### Chore
- **Actualización del Índice de Canciones:** Se han añadido las canciones `deftones-change-in-the-house-of-flies` y `gojira-silvera` al índice de datos para que aparezcan en la aplicación.

### Fixed
- **Guardado de Traducciones:** Se corrigió un error en la herramienta de sincronización donde las traducciones realizadas después de marcar los tiempos no se guardaban en el JSON final. Ahora el resultado se actualiza dinámicamente.
- **Integración API Traducción:** Se ajustó el formato de envío de datos al backend para coincidir con la estructura esperada (array de líneas).

## [0.6.0] - 2025-12-08

### Added
- **Modo de Edición:** Nueva funcionalidad que permite cargar canciones previamente sincronizadas para realizar correcciones.
- **Inputs de Tiempo:** Se añadieron campos numéricos editables para ajustar manualmente el timestamp de cada línea.
- **Edición de Texto en Línea:** Ahora es posible corregir errores tipográficos en la letra original sin perder la sincronización de tiempos.
- **Controles de Re-sincronización:**
    - Botón `⏮` ("Punch-in") para reiniciar la grabación de tiempos desde una línea específica.
    - Botón `🔊` para probar el tiempo exacto de una línea saltando el video a ese punto.
- **Botón de Edición Rápida:** Añadido un botón "✏️ Editar" en la lista de canciones de la página principal.

### Changed
- **Lógica de Guardado (Refactor):** El manejo del array de sincronización (`handleMarkTime`) ahora permite sobrescribir líneas existentes en lugar de solo anexar al final, facilitando el "punch-in".

## [0.7.0] - 2025-12-08

### Added
- **Gestión de Biblioteca:** Nueva interfaz de inicio con diseño de cuadrícula (Grid) y tarjetas de canciones con portadas (thumbnails).
- **Buscador Universal:** Barra de búsqueda en tiempo real para filtrar canciones por título o artista.
- **Eliminación de Canciones:** Implementada la funcionalidad para borrar canciones permanentemente (Frontend y API `DELETE`), con confirmación de seguridad.
- **Scroll en Biblioteca:** Habilitado scroll vertical independiente para la lista de canciones con cabecera fija ("sticky"), permitiendo navegar bibliotecas extensas.

## [0.5.2] - 2025-12-08

### Fixed
- **Duplicación de Títulos:** Implementada lógica robusta en Frontend y Backend para limpiar redundancias en los nombres de canciones (ej. "Slipknot - Slipknot - Song" -> "Song").
- **Layout SyncTool:** Corregido desbordamiento de botones mediante `flex-wrap` y habilitado scroll vertical en el área del reproductor (`overflow-y: auto`).

### Connected
- **Preview de Metadatos:** Añadido panel visual compacto en la herramienta de sincronización para confirmar Artista y Título antes de guardar.

## [0.5.2] - 2025-12-08

### Fixed
- **Duplicación de Títulos:** Implementada lógica robusta en Frontend y Backend para limpiar redundancias en los nombres de canciones (ej. "Slipknot - Slipknot - Song" -> "Song").
- **Layout SyncTool:** Corregido desbordamiento de botones mediante `flex-wrap` y habilitado scroll vertical en el área del reproductor (`overflow-y: auto`). Implementado diseño "Sticky Footer" para mantener los controles de acción siempre visibles.

### Connected
- **Preview de Metadatos:** Añadido panel visual compacto en la herramienta de sincronización para confirmar Artista y Título antes de guardar.

## [0.5.1] - 2025-12-08

### Changed
- **Refactor UI Sincronización:** Eliminada la visualización del JSON crudo por una interfaz más limpia. Los tiempos ahora se muestran en línea junto a la letra original.
- **Indicadores de Progreso:** El botón "Guardar" ahora funciona como un semáforo (Rojo=Vacío, Amarillo=En Progreso, Verde=Completo) y muestra el conteo de líneas sincronizadas.
- **Lógica de Inicialización:** Al importar letras automáticamente, la sincronización se inicia explícitamente vacía para evitar que el sistema crea que ya está lista para guardar.

## [0.5.0] - 2025-12-08

### Added
- **Automatización de Letras (Auto-Fetch):** Implementado sistema robusto para obtener letras automáticamente desde YouTube Captions y AZLyrics.
- **Soporte Puppeteer:** Integrado Puppeteer para evadir protecciones anti-scraping en AZLyrics.
- **Fallback a Google Search:** Si la URL directa falla o el nombre del canal es ambiguo, el sistema busca en Google el enlace correcto de AZLyrics.
- **Modo Vista Previa:** Las letras obtenidas no se guardan automáticamente. Se muestran en el frontend para revisión antes de persistir.
- **Mejoras UX Sincronización:** 
    - Botón manual "Buscar Letra Automática".
    - Eliminación de alertas intrusivas.
    - Sincronización de scroll entre columna original y traducción.
    - Limpieza automática de datos al iniciar una nueva sincronización.

### Fixed
- **Extracción de Metadatos:** Corregida la lógica para limpiar sufijos como " - Topic" de los nombres de canales de YouTube, mejorando la tasa de éxito en la búsqueda de letras.
- **Persistencia de Artista:** El frontend ahora respeta y guarda el nombre del artista detectado por el backend, en lugar de sobreescribirlo con el título del video.

## [0.4.0] - 2025-09-24

### Added
- **Traducción Automática:** La página del reproductor ahora llama a una API (`/api/translate`) para traducir automáticamente las letras al español usando DeepL.

### Changed
- **Flujo de Sincronización Simplificado:** La Herramienta de Sincronización ahora solo se ocupa de la letra original y los tiempos, acorde al flujo de trabajo definido.
- **Estandarización del Modelo de Datos:** Todos los archivos JSON de canciones ahora usan un formato único (`{time, original}`).

### Fixed
- **Layout del Reproductor:** Corregido el error que causaba que el video se superpusiera a las letras.
- **Copia en Herramienta de Sincronización:** El botón de copiar JSON ahora se deshabilita hasta que la sincronización se completa, evitando copiar `null`.

## [0.3.0] - 2025-09-24

### Fixed
- **Sincronización de Letras:** Se ajustó la lógica de tiempo y se añadió un control deslizable para ajuste manual.
- **Scroll del Reproductor:** Se eliminó el scroll horizontal y se implementó un auto-scroll vertical contenido únicamente en el área de las letras.
- **Layout General:** Se reestructuró el CSS para lograr un layout de página completa sin scroll principal.

## [0.2.0] - 2025-09-24

### Added
- **Herramienta de Sincronización Manual.**
- **Reproductor de Letras Sincronizadas** (versión inicial).
- **Sistema de Rutas** con `react-router-dom`.
- **Backend para Búsqueda de Letras**.

## [0.1.0] - 2025-09-24

### Added
- **Inicialización del Proyecto** con Vite (React + TypeScript).
- **Documentación Inicial**.