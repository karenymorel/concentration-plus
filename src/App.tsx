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

  return (
    <main className="flex flex-col md:flex-row h-screen w-full text-custom-text bg-custom-bg overflow-hidden transition-colors duration-300">
      {/* SIDEBAR */}
      <section className="w-full md:w-2/6 z-10 bg-custom-sidebar border-r border-white/5 h-full flex-shrink-0">
        <Sidebar />
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="flex-1 flex flex-col h-full relative">
        <div className="flex justify-end p-2 flex-shrink-0 absolute top-0 right-0 z-50">
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto w-full h-full relative">
          {/* 
            EL TRUCO DE LA FASE 1: 
            En vez de usar &&, usamos CSS. Si no es la pantalla actual, le ponemos "hidden".
            Así, el Timer sigue corriendo de fondo aunque no lo veas.
          */}

          <div
            className={`h-full w-full flex items-center justify-center ${pantallaActual === "reloj" ? "block" : "hidden"}`}
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
        </div>

        <div className={`h-full w-full ${pantallaActual === "historial" ? "block" : "hidden"}`}>
          <Historial />
        </div>
      </section>

      <Toaster position="bottom-right" richColors theme="dark" />
    </main>
  );
}

export default App;
