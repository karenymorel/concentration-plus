import Sidebar from "./components/Sidebar";
import Timer from "./components/Timer";
import Estadisticas from "./components/Estadisticas";
import ThemeToggle from "./components/ThemeToggle";
import { useConfigStore } from "./store/useConfigStore";
import Calendario from "./components/Calendario";
import Configuracion from "./components/Configuracion";
import Historial from "./components/Historial"; // Me aseguro de importarlo
import { Toaster } from "sonner";

function App() {
  const configActiva = useConfigStore((state) => state.configActiva);
  const pantallaActual = useConfigStore((state) => state.pantallaActual);

  return (
    // 🛠️ CAMBIO 1: min-h-[100dvh] en lugar de h-screen para que en móvil se pueda scrollear si no cabe.
    // 🛠️ CAMBIO 2: flex-col-reverse pone el reloj ARRIBA y el menú ABAJO en celulares.
    <main className="flex flex-col-reverse md:flex-row min-h-[100dvh] md:h-screen w-full text-custom-text bg-custom-bg transition-colors duration-300">
      {/* SIDEBAR */}
      <section className="w-full md:w-80 h-auto md:h-full z-10 bg-custom-sidebar border-t md:border-t-0 md:border-r border-white/5 flex-shrink-0">
        <Sidebar />
      </section>

      {/* CONTENIDO PRINCIPAL */}
      <section className="flex-1 flex flex-col h-full relative">
        <div className="flex justify-end p-2 flex-shrink-0 absolute top-0 right-0 z-50">
          <ThemeToggle />
        </div>

        {/* 🛠️ CAMBIO 3: overflow-visible en móvil, overflow-y-auto en PC */}
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
