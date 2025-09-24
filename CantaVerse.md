# 1. Título y Resumen del Proyecto

**Título del Proyecto:** CantaVerse: Aplicación de Letras Sincronizadas y Traducción

**Resumen:** Creación de una aplicación web para sincronizar y remarcar en tiempo real los versos de una canción con su letra. El proyecto también incluirá una funcionalidad de traducción en pantalla dividida, mostrando simultáneamente la letra original y su traducción. El enfoque inicial del desarrollo se centrará en la sincronización manual para un prototipo funcional.

---

# 2. Funcionalidades Clave

### 2.1. Funcionalidad de Sincronización

- **Remarcado en Tiempo Real:** La aplicación deberá resaltar la línea o verso que se está cantando en el momento exacto.
- **Reproducción de Música:** El usuario podrá reproducir una canción directamente en la aplicación.

### 2.2. Funcionalidad de Traducción

- **Pantalla Dividida:** La interfaz mostrará la letra original y su traducción lado a lado.
- **Traducción Sincronizada:** El remarcado del verso deberá ocurrir simultáneamente en ambos idiomas.
- **Selección de Idioma:** El usuario podrá elegir el idioma al que desea traducir la letra.

---

# 3. Consideraciones Técnicas y de Desarrollo

### 3.1. Estrategia de Sincronización Inicial (Prototipo)

- **Sincronización Manual:** En la etapa inicial, la sincronización se realizará de forma manual. Se requerirá un mecanismo para que el usuario ingrese o copie la letra de la canción y, mientras la escucha, presione una tecla para marcar el tiempo de inicio de cada verso.
- **Formato de Datos:** Los datos de la letra y sus marcas de tiempo se almacenarán en un formato estructurado y fácil de manipular, como **JSON**. El formato incluirá el tiempo de inicio y el texto de cada verso.

### 3.2. Plataforma de Desarrollo

- **Plataforma Principal:** Aplicación web (React, Vue, o Angular).
- **Potencial Futuro:** Adaptación a plataformas móviles.

### 3.3. Integración con APIs (Etapa posterior)

- **API de Detección de Música:** Para identificar la canción que se reproduce, se investigará la viabilidad de utilizar la API de Spotify u otros servicios similares.
- **API de Letras Sincronizadas:** Para la automatización futura, se explorarán APIs como la de Musixmatch o Genius que ofrecen letras con marcas de tiempo.
- **API de Traducción:** Se integrará una API de traducción (Google Translate o DeepL) para la funcionalidad multilingüe.

---

# 4. Próximos Pasos

1. **Diseño del Prototipo:** Planificar y diseñar la interfaz de usuario, incluyendo el sistema de pantalla dividida y la herramienta para marcar los tiempos de forma manual.
2. **Desarrollo de la Sincronización Manual:** Construir el componente central de la aplicación que pueda leer un archivo JSON con los tiempos y resaltar los versos en un reproductor de audio.
3. **Investigación de APIs:** Investigar la documentación, costos y viabilidad de las APIs de Spotify, Musixmatch y Google Translate para planificar la siguiente etapa de automatización.
