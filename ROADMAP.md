# Roadmap del Proyecto CantaVerse

## ✅ Milestone 1: Prototipo Funcional

- [x] **Configuración del Entorno de Desarrollo**
- [x] **Inicialización del Proyecto**
- [x] **Creación de Documentación Inicial**
- [x] **Pivote a Reproductor de YouTube**
- [x] **Implementación de Búsqueda de Letras (Plan B)**
- [x] **Desarrollo de la Herramienta de Sincronización Manual**
- [x] **Implementación del Reproductor Sincronizado Final**

## ✅ Milestone 2: Refinamiento del Prototipo

- [x] **Ajuste de Sincronización:** Corregida la lógica de tiempo y añadido un control deslizable para ajuste manual.
- [x] **Arreglos de Layout:** Solucionado el scroll horizontal, implementado auto-scroll vertical solo para las letras y conseguido un layout de página completa sin scroll principal.
- [x] **Consistencia de Flujo:** Refactorizadas las páginas de Reproductor y Herramienta de Sincronización para un flujo de usuario lógico.

## ✅ Milestone 2.5: Corrección y Finalización de Funcionalidades

- [x] **1. Corregir Visualización de Traducciones:** Se verificó que la lógica para obtener y mostrar las traducciones desde la API funciona correctamente.

## ✅ Milestone 3: Persistencia de Datos con Base de Datos

- [x] **Implementar Base de Datos para Canciones:**
    - **Objetivo:** Almacenar de forma permanente las canciones procesadas.
    - **Tecnología Seleccionada:** Se utilizó una base de datos **MySQL en Railway** junto con **Prisma ORM**.
    - **Pasos de Implementación:**
        1.  Se conectó a la base de datos existente y se configuró la variable de entorno `DATABASE_URL`.
        2.  Se validó el `schema.prisma` para usar el proveedor `mysql`.
        3.  Se sincronizó el esquema con la base de datos usando `prisma migrate`.
        4.  Se implementó y depuró por completo el flujo de guardado manual desde la `SyncToolPage` a la base de datos a través de la API `POST /api/songs`.

## ✅ Milestone 3.5: Añadir Traducción al Flujo de Guardado

- [x] **Añadir Traducción al Proceso de Sincronización:**
    - **Objetivo:** Permitir la traducción de la letra durante el proceso de sincronización para que se guarde en la base de datos junto con la letra original y los tiempos.
    - **Pasos de Implementación:**
        1.  Añadir un botón "Traducir" a `SyncToolPage.tsx`.
        2.  Implementar la llamada a la API `/api/translate` para obtener la letra traducida.
        3.  Añadir un nuevo estado y una nueva columna para mostrar la letra traducida en la `SyncToolPage`.
        4.  Modificar la función `getFinalJson` para incluir la letra traducida en el objeto que se envía a la API de guardado.

## ✅ Milestone 4: Funcionalidades Avanzadas

- [x] **Automatizar Obtención de Letras:**
    - **Objetivo:** Implementar una función en el backend que, dado un `youtubeId`, busque automáticamente la letra de la canción (ej. desde los subtítulos de YouTube) si esta no existe en la base de datos.
    - **Lógica a implementar en `GET /api/songs/[youtubeId].ts`:**
        - Si la canción no se encuentra en la base de datos:
            1.  Implementar la lógica de fetching en `api/fetch-lyrics.ts`.
            2.  Llamar a esta nueva función para obtener la letra.
            3.  Devolver la canción en modo "Vista Previa" (sin guardar automáticamente).
    - **Fuentes Adicionales (Fallback):**
        - Implementado scraper para **AZLyrics** con soporte de Puppeteer y búsqueda de respaldo en Google.
        - Lógica de fallback: YouTube Captions -> AZLyrics (Directo) -> Google Search (AZLyrics) -> Retorno vacío.

## 🛠️ Milestone 4.5: Edición y Corrección
- [x] **Modo de Edición de Sincronización:**
    - **Objetivo:** Permitir al usuario corregir una sincronización existente (malos tiempos o letra incorrecta).
    - **Funcionalidades:**
        - [x] Cargar una configuración guardada en la herramienta de sincronización. (Automático vía API)
        - [x] **Ajuste de Tiempos:** Poder modificar el tiempo de cada línea individualmente.
        - [x] **Edición de Texto:** Poder corregir erratas en la letra original sin perder los tiempos.
        - [x] "Resincronizar" secciones específicas.
- [x] **Gestión de Canciones:** Crear un sistema para listar y seleccionar las canciones de la base de datos. (Implementado: Búsqueda, Grid, Delete)
- [ ] **Autenticación de Usuarios.**
- [ ] **Rediseño Estético General.**