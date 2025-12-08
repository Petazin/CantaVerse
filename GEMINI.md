# Registro de Cambios - CantaVerse (Assistant: Antigravity)

## Sesión: Implementación de Modo Edición y Corrección (v0.6.0)
**Fecha:** 2025-12-08

### Cambios Realizados:
1.  **Modo de Edición Completo:**
    - Se habilita la carga de sincronizaciones existentes para su corrección.
    - **Edición de Tiempos:** Ahora es posible ajustar manualmente el timestamp de cada línea mediante inputs numéricos.
    - **Edición de Texto:** Se implementó la edición en línea de la letra (`contentEditable` like behavior) sin perder los tiempos asociados.
    - **Herramientas de Precisión:**
        - Botón `⏮`: Permite "golpear" (punch-in) la grabación desde una línea específica.
        - Botón `🔊`: Permite escuchar el momento exacto marcado para verificar la sincronización.
2.  **Mejoras en Navegación:**
    - **HomePage (Biblioteca):** Se añadió un botón "✏️ Editar" junto a cada canción listada para acceso rápido a la herramienta de corrección.
3.  **Refactorización Técnica:**
    - Optimización de `SyncToolPage` para manejar estados de edición parcial (sobrescritura en lugar de solo anexado).

### Archivos Modificados:
- `src/pages/HomePage.tsx`: Botón de entrada a edición.
- `src/pages/SyncToolPage.tsx`: Lógica de edición, inputs, controles de reproducción y re-sincronización.
- `ROADMAP.md`: Actualización de estado (Milestone 4.5 completado).
