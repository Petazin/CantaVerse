# Roadmap del Proyecto CantaVerse

## ✅ Milestone 1: Prototipo Funcional

- [x] **Configuración del Entorno de Desarrollo**
  - [x] Instalar Node.js y npm.
  - [x] Configurar políticas de ejecución de scripts.
- [x] **Inicialización del Proyecto**
  - [x] Crear la aplicación base con Vite (React + TypeScript).
  - [x] Instalar dependencias iniciales.
- [x] **Creación de Documentación Inicial**
  - [x] `README.md`, `CHANGELOG.md`, `ROADMAP.md`.
- [x] **Pivote a Reproductor de YouTube**
  - [x] Instalar `react-youtube`.
  - [x] Implementar reproductor básico de YouTube.
- [x] **Implementación de Búsqueda de Letras (Plan B)**
  - [x] Crear API serverless para buscar letras en fuentes externas.
  - [x] Implementar lógica de limpieza de títulos y fallback entre proveedores.
- [x] **Desarrollo de la Herramienta de Sincronización Manual**
  - [x] Implementar sistema de rutas con `react-router-dom`.
  - [x] Diseñar la interfaz de la herramienta de sincronización.
  - [x] Implementar la lógica para marcar tiempos y generar JSON.
- [x] **Implementación del Reproductor Sincronizado Final**
  - [x] Cargar un archivo JSON local con datos de una canción.
  - [x] Implementar la lógica de resaltado en tiempo real en la página principal.

## 🎯 Milestone 2: Refinamiento y Mejoras de UX

- [ ] **Mejoras de Estilo:** Aplicar un diseño visual más pulido a toda la aplicación.
- [ ] **Gestión de Canciones:**
  - [ ] Crear un sistema para listar y seleccionar las canciones sincronizadas disponibles (los archivos JSON en `/data`).
  - [ ] La página principal mostrará una lista de canciones en lugar de una sola hardcodeada.
- [ ] **Mejoras en el Reproductor:**
  - [ ] Auto-scroll suave en la vista de letras.
  - [ ] Permitir al usuario hacer clic en una línea para saltar a ese punto del video.
- [ ] **Mejoras en la Herramienta de Sincronización:**
  - [ ] Posibilidad de editar/ajustar un tiempo marcado.
  - [ ] Guardar el progreso en el LocalStorage del navegador para no perder el trabajo si se cierra la pestaña.

## 🚀 Milestone 3: Funcionalidades Avanzadas

- [ ] **Base de Datos:** Investigar e implementar una base de datos (ej. Firebase, Supabase) para almacenar y gestionar las canciones sincronizadas.
- [ ] **Autenticación de Usuarios:** Permitir a los usuarios registrarse y guardar sus propias listas de canciones.
- [ ] **Revisitar Búsqueda Automática:** Investigar APIs de letras más robustas que requieran clave (ej. Genius) para reintroducir la funcionalidad del Plan A de forma fiable.