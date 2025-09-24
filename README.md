# CantaVerse: Aplicación de Letras Sincronizadas y Traducción

Una aplicación web para visualizar letras de canciones sincronizadas en tiempo real con un video de YouTube. Incluye una herramienta dedicada para crear y exportar tus propias sincronizaciones.

## 🚀 Funcionalidades

- **Reproductor Sincronizado:** Visualiza la letra de una canción que se resalta en tiempo real al ritmo de un video de YouTube.
- **Herramienta de Sincronización Manual:** Una página dedicada para que los usuarios puedan:
  - Cargar cualquier video de YouTube.
  - Pegar la letra de la canción.
  - Marcar los tiempos de cada verso usando la barra espaciadora.
  - Generar y exportar un archivo JSON con la sincronización completa.
- **Búsqueda de Letras (Experimental):** Un sistema de API que intenta buscar la letra de una canción automáticamente a partir del título del video.

## 🛠️ Tecnologías Utilizadas

- **Framework:** React con Vite
- **Lenguaje:** TypeScript
- **Navegación:** React Router
- **Backend:** Funciones Serverless (Node.js) desplegadas en Vercel.

## 🏁 Cómo Empezar

1.  **Clonar el repositorio** (cuando esté disponible).
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Instalar la CLI de Vercel (si no la tienes):**
    ```bash
    npm install -g vercel
    ```
4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    vercel dev
    ```
    Este comando levanta tanto el frontend de Vite como las funciones de la API.

## 🏗️ Estructura del Proyecto

- **/api:** Contiene las funciones serverless (backend).
- **/src/pages:** Componentes de React que representan las páginas principales de la aplicación.
- **/src/components:** Componentes de React reutilizables.
- **/src/data:** Contiene los archivos JSON de las canciones sincronizadas.
