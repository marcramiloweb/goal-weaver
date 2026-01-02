# Widgets de Android para Propósitos 2026

## Instalación

Después de hacer `git pull`, sigue estos pasos:

### 1. Copia los archivos Kotlin
Copia los archivos `.kt` a:
```
android/app/src/main/java/app/lovable/propositos2026/widgets/
```

### 2. Copia los recursos
Copia el contenido de `res/` a:
```
android/app/src/main/res/
```

Estructura de carpetas:
- `res/layout/` → layouts de los widgets
- `res/xml/` → configuración de widgets
- `res/drawable/` → fondos y iconos
- `res/values/` → strings

### 3. Actualiza AndroidManifest.xml
Añade los receivers del archivo `AndroidManifest_additions.xml` dentro de la etiqueta `<application>` en:
```
android/app/src/main/AndroidManifest.xml
```

### 4. Sincroniza y compila
```bash
npx cap sync android
```

Luego abre Android Studio y compila el proyecto.

## Widgets disponibles

### 🎯 Widget "Mis Metas"
- Muestra 3 metas destacadas con barra de progreso
- Tamaño mínimo: 250dp x 150dp
- Se actualiza cada 30 minutos

### 📋 Widget "Tareas de Hoy"
- Muestra hasta 4 tareas del día
- Indica cuántas están completadas
- Tamaño mínimo: 250dp x 180dp

## Sincronización de datos

Los widgets leen datos de SharedPreferences. Para sincronizar los datos desde la app web, 
necesitarás implementar un plugin de Capacitor o usar el plugin `@capacitor/preferences`:

```typescript
import { Preferences } from '@capacitor/preferences';

// Guardar datos para el widget de metas
await Preferences.set({
  key: 'GoalsWidgetData',
  value: JSON.stringify({
    goal1_title: 'Mi meta 1',
    goal1_progress: 75,
    // ...
  })
});
```

## Personalización

Puedes modificar los colores en:
- `widget_background.xml` - Fondo del widget
- `progress_bar_*.xml` - Colores de las barras de progreso
