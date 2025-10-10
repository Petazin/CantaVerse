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

## 🎯 Milestone 2.5: Corrección y Finalización de Funcionalidades

- [ ] **1. Corregir Visualización de Traducciones:**
    - **Análisis del Problema:** Actualmente, la interfaz muestra el título "Traducción" pero no el contenido de la letra traducida.
    - **Pasos de Implementación:**
        1.  **Revisar `PlayerPage.tsx`:** Inspeccionar el componente para entender cómo se consume y renderiza el estado de la traducción.
        2.  **Verificar Flujo de Datos:** Analizar el `useEffect` o hook encargado de llamar a la API de traducción (`/api/translate`) y asegurar que la respuesta se almacena correctamente en el estado del componente.
        3.  **Inspeccionar la API `/api/translate.ts`:** Confirmar que la API procesa la petición, llama al servicio de traducción (DeepL) y devuelve la letra traducida en el formato esperado.
        4.  **Validar Modelo de Datos:** Revisar si el modelo de datos de la canción en el frontend (`SongData` en `types.ts`) incluye un campo para la letra traducida y si este se está utilizando.
        5.  **Renderizado Condicional:** Implementar la lógica para que la columna de traducción muestre un estado de "cargando" mientras se espera la respuesta de la API y el contenido una vez que se recibe.

## 🎯 Milestone 3: Persistencia de Datos con Base de Datos

- [ ] **Implementar Base de Datos para Canciones:**
    - **Objetivo:** Almacenar de forma permanente las canciones procesadas (letra original, traducción y tiempos) para optimizar el rendimiento y reducir costos de API.
    - **Tecnología Seleccionada:** Se utilizará **Vercel Postgres** junto con **Prisma ORM**.
    - **Pasos de Implementación:**
        1.  **Configuración de la Base de Datos:**
            - Crear un nuevo proyecto de Vercel Postgres.
            - Obtener la URL de conexión (`POSTGRES_URL`).
            - Configurar las variables de entorno en Vercel y localmente (`.env`).
        2.  **Definición del Esquema de Datos:**
            - Actualizar `prisma/schema.prisma` para definir un modelo `Song` con campos para `youtubeId`, `artist`, `title`, `lyrics` (JSON), y `translatedLyrics` (JSON).
        3.  **Migración de la Base de Datos:**
            - Ejecutar `npx prisma migrate dev --name init-song-model` para crear la tabla en la base de datos.
        4.  **Actualización de la Lógica de la API:**
            - Modificar el endpoint `api/songs/[youtubeId].ts` para que primero consulte la base de datos. Si la canción no existe, la procesa, la guarda en la base de datos y luego la devuelve.

## 🚀 Milestone 4: Funcionalidades Avanzadas

- [ ] **Gestión de Canciones:** Crear un sistema para listar y seleccionar las canciones de la base de datos.
- [ ] **Autenticación de Usuarios.**
- [ ] **Rediseño Estético General.**