# Registro de Cambios - CantaVerse (Assistant: Antigravity)

## Sesión: Refinamiento de UX y Bugfixes (v0.5.1)
**Fecha:** 2025-12-08

### Cambios Realizados:
1.  **Limpieza de Interfaz:** Se eliminó la columna de JSON en `SyncToolPage` para reducir ruido visual.
2.  **Feedback Visual Mejorado:**
    - Botón "Guardar" con lógica de semáforo (Rojo/Amarillo/Verde).
    - Tooltip con progreso exacto (ej. "Progreso: 15/40").
    - Visualización de timestamps *inline* junto a la letra original.
3.  **Corrección de Estado Inicial:** Fix crítico donde el *auto-fetch* llenaba la sincronización con ceros, habilitando falsamente el botón de guardar. Ahora se fuerza un inicio limpio.

### Archivos Modificados:
- `src/pages/SyncToolPage.tsx`: Implementación completa del nuevo UI y lógica de estados.
- `CHANGELOG.md`: Registro de la iteración.
