# Changelog

Toda la información relevante sobre los cambios del proyecto se documentará en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Próximos Cambios
- Mejoras de estilo y experiencia de usuario.
- Refinamientos basados en el feedback del prototipo.

## [0.2.0] - 2025-09-24

### Added
- **Herramienta de Sincronización Manual:** Creada una página dedicada (`/sync-tool`) que permite a los usuarios:
  - Cargar un video de YouTube.
  - Pegar la letra de una canción.
  - Marcar los tiempos de cada verso usando la barra espaciadora.
  - Generar un objeto JSON completo con metadatos y la letra sincronizada.
- **Reproductor de Letras Sincronizadas:** La página principal ahora carga un archivo JSON local y sincroniza la letra con el video de YouTube en tiempo real.
- **Sistema de Rutas:** Implementado `react-router-dom` para la navegación entre el reproductor y la herramienta de sincronización.
- **Backend para Búsqueda de Letras (Plan B):** Creada una API serverless (`/api/get-song-data`) que:
  - Limpia títulos de videos de YouTube.
  - Intenta buscar letras en múltiples proveedores externos en cascada.
- **Estructura de Proyecto Escalable:** Organizadas las carpetas en `pages`, `components`, `data`, etc.

### Changed
- **Pivote de MP3 a YouTube:** Se cambió el enfoque de usar archivos MP3 locales a usar videos de YouTube como fuente de audio.
- **Pivote de Búsqueda Automática a Manual:** Debido a la inestabilidad de las APIs de letras, se priorizó la creación de la herramienta de sincronización manual sobre la búsqueda automática.

## [0.1.0] - 2025-09-24

### Added
- **Inicialización del Proyecto:** Se creó el proyecto base utilizando Vite (React + TypeScript).
- **Documentación Inicial:** Se crearon los archivos `README.md`, `CHANGELOG.md` y `ROADMAP.md`.