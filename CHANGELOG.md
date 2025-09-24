# Changelog

Toda la información relevante sobre los cambios del proyecto se documentará en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Próximos Cambios
- Implementación de la funcionalidad de traducción automática con fallback manual.
- Rediseño estético general de la interfaz.

## [0.3.0] - 2025-09-24

### Fixed
- **Sincronización de Letras:** Se ajustó la lógica de tiempo para que el resaltado se sienta más preciso.
- **Scroll del Reproductor:** Se eliminó el scroll horizontal y se implementó un auto-scroll vertical contenido únicamente en el área de las letras, manteniendo el video fijo.
- **Layout General:** Se reestructuró el CSS para lograr un layout de página completa sin scroll principal.

### Added
- **Ajuste Manual de Sincronización:** Se añadió un control deslizable en el reproductor para que el usuario pueda ajustar la anticipación del resaltado en tiempo real.

## [0.2.0] - 2025-09-24

### Added
- **Herramienta de Sincronización Manual:** Creada una página dedicada (`/sync-tool`) para generar archivos JSON de letras sincronizadas.
- **Reproductor de Letras Sincronizadas:** La página principal ahora carga un archivo JSON local y sincroniza la letra.
- **Sistema de Rutas:** Implementado `react-router-dom`.
- **Backend para Búsqueda de Letras:** Creada una API serverless para buscar letras en fuentes externas.

### Changed
- **Pivote de MP3 a YouTube:** Se cambió el enfoque a videos de YouTube.
- **Pivote de Búsqueda Automática a Manual:** Se priorizó la herramienta de sincronización manual.

## [0.1.0] - 2025-09-24

### Added
- **Inicialización del Proyecto:** Proyecto base con Vite (React + TypeScript).
- **Documentación Inicial:** `README.md`, `CHANGELOG.md`, `ROADMAP.md`.
