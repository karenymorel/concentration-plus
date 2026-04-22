# 💎 Concentration PLUS – Pomodoro Timer

Aplicación Pomodoro moderna con estadísticas, historial, calendario y sincronización con Google Calendar.  
Desarrollada con **React + TypeScript + Zustand + TailwindCSS**.

### LINK DEMO: https://concentration-plus.vercel.app/

## ✨ Características

- ⏱️ **Temporizador Pomodoro** con animación SVG circular y modos: trabajo, descanso corto, descanso largo.
- 📊 **Estadísticas** dinámicas: gráficos de progreso diario/semanal/mensual.
- 📜 **Historial** de sesiones: registra cada pomodoro completado o abortado, con fecha, duración y estado.
- 📅 **Calendario** visual para ver tu actividad día a día.
- ⚙️ **Configuraciones personalizables**: crea, edita y elimina tus propios preajustes (duración de trabajo/descanso, ciclos).
- 🌙 **Modo claro / oscuro** (día/noche) que persiste en el almacenamiento local.
- 🔔 **Notificaciones** y sonidos al finalizar cada sesión.
- 🔗 **Integración con Google Calendar** (opcional): guarda automáticamente los pomodoros completados como eventos.
- 📱 **Diseño 100% responsivo**: funciona perfectamente en celualres, tablets y escritorio.
- 💾 **Persistencia de datos** con Zustand + localStorage: tu configuración e historial nunca se pierden.

## 🧪 Modo demostración (demo)

El proyecto incluye un **modo demo** que se activa mediante una variable de entorno.  
En el repositorio (GitHub) la aplicación arranca **completamente vacía** (sin datos precargados), ideal para que los reclutadores vean el código base limpio.  
En el despliegue de **Vercel** se activa el modo demo, mostrando preajustes de ejemplo y un historial de sesiones ficticio para que la experiencia de prueba sea más atractiva.

Para activar el modo demo localmente, crea un archivo `.env` en la raíz:

```env
VITE_DEMO_MODE=true
```

Con false o sin la variable, la aplicación inicia sin datos.

## 🛠️ Tecnologías utilizadas

- React 18 + TypeScript
- Zustand
- TailwindCSS
- React Icons
- Sonner
- Recharts
- Google Calendar API
- Vite (entorno de desarrollo y build)

## 📄 Licencia
Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## ✍️ Autor
Karen Morel – @karenymorel 
