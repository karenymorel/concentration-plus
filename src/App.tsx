import { useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Timer from "./components/Timer";
import Estadisticas from "./components/Estadisticas";
import ThemeToggle from "./components/ThemeToggle";
import { useConfigStore } from "./store/useConfigStore";
import Calendario from "./components/Calendario";
import Configuracion from "./components/Configuracion";
import Historial from "./components/Historial";
import { Toaster } from "sonner";

function App() {
  const configActiva = useConfigStore((state) => state.configActiva);
  const pantallaActual = useConfigStore((state) => state.pantallaActual);
  const listaConfiguraciones = useConfigStore((state) => state.listaConfiguraciones);
  const agregarConfiguracion = useConfigStore((state) => state.agregarConfiguracion);
  const setConfigActiva = useConfigStore((state) => state.setConfigActiva);

  useEffect(() => {
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

    if (!isDemoMode) {
      // Modo NO demo: asegurarse de que el store esté completamente vacío
      // Si ya hay configuraciones (demo o reales), las borramos
      if (listaConfiguraciones.length > 0) {
        // Resetear el store a su estado inicial vacío
        useConfigStore.setState({
          listaConfiguraciones: [],
          configActiva: null,
          historial: [],
        });
        // También limpiar localStorage para que no persista
        localStorage.removeItem("pomodoro-config-storage");
      }
      return;
    }

    // Modo demo: cargar datos demo solo si no existen o están vacíos
    if (isDemoMode && listaConfiguraciones.length === 0) {
      // Crear presets
      const presets = [
        {
          id: "demo1",
          nombre: "25/5 Estudio",
          tiempo_trabajo: 25,
          tiempo_corto_descanso: 5,
          tiempo_largo_descanso: 15,
          ciclos_hasta_descanso_largo: 4,
        },
        {
          id: "demo2",
          nombre: "50/10 Deep Work",
          tiempo_trabajo: 50,
          tiempo_corto_descanso: 10,
          tiempo_largo_descanso: 30,
          ciclos_hasta_descanso_largo: 3,
        },
        {
          id: "demo3",
          nombre: "15/3 Rápido",
          tiempo_trabajo: 15,
          tiempo_corto_descanso: 3,
          tiempo_largo_descanso: 10,
          ciclos_hasta_descanso_largo: 4,
        },
      ];

      presets.forEach((preset) => agregarConfiguracion(preset));
      setConfigActiva(presets[0]);

      // Historial con fechas reales
      const hoy = new Date().toISOString().split("T")[0];
      const ayer = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const anteayer = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];

      const historialDemo = [
        { id: "hist1", fecha: hoy, minutos: 25, minutosDescanso: 5, completado: true, nombreModo: "25/5 Estudio" },
        { id: "hist2", fecha: hoy, minutos: 25, minutosDescanso: 5, completado: true, nombreModo: "25/5 Estudio" },
        { id: "hist3", fecha: ayer, minutos: 50, minutosDescanso: 10, completado: true, nombreModo: "50/10 Deep Work" },
        { id: "hist4", fecha: ayer, minutos: 15, minutosDescanso: 0, completado: false, nombreModo: "15/3 Rápido" },
        { id: "hist5", fecha: anteayer, minutos: 25, minutosDescanso: 5, completado: true, nombreModo: "25/5 Estudio" },
      ];

      useConfigStore.setState({ historial: historialDemo });
    }
  }, [listaConfiguraciones, agregarConfiguracion, setConfigActiva]);

  return (
    <main className="flex flex-col-reverse md:flex-row min-h-[100dvh] md:h-screen w-full text-custom-text bg-custom-bg transition-colors duration-300">
      <section className="w-full md:w-80 h-auto md:h-full z-10 bg-custom-sidebar border-t md:border-t-0 md:border-r border-white/5 flex-shrink-0">
        <Sidebar />
      </section>

      <section className="flex-1 flex flex-col h-full relative">
        <div className="flex justify-end p-2 flex-shrink-0 absolute top-0 right-0 z-50">
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-visible md:overflow-y-auto w-full h-full relative">
          <div
            className={`h-full w-full flex items-center justify-center py-10 md:py-0 ${pantallaActual === "reloj" ? "block" : "hidden"}`}
          >
            <Timer configuracion={configActiva} />
          </div>
          <div className={`h-full w-full ${pantallaActual === "estadisticas" ? "block" : "hidden"}`}>
            <Estadisticas />
          </div>
          <div className={`h-full w-full ${pantallaActual === "calendario" ? "block" : "hidden"}`}>
            <Calendario />
          </div>
          <div className={`h-full w-full ${pantallaActual === "configuracion" ? "block" : "hidden"}`}>
            <Configuracion />
          </div>
          <div className={`h-full w-full ${pantallaActual === "historial" ? "block" : "hidden"}`}>
            <Historial />
          </div>
        </div>
      </section>

      <Toaster position="bottom-right" richColors theme="dark" />
    </main>
  );
}

export default App;
