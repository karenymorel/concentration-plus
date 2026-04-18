import { useState } from "react";
import { FiSettings, FiCalendar, FiClock, FiEdit2, FiTrash2 } from "react-icons/fi";
import { MdAutoGraph } from "react-icons/md";
import ModalConfig from "./ModalConfig";
import ModalEliminar from "./ModalEliminar";
import { useConfigStore } from "../store/useConfigStore";
import { ConfigPomodoro } from "../models/ConfigPomodoro";
import { FaClipboardList } from "react-icons/fa"; // Arriba

export default function Sidebar() {
  const {
    listaConfiguraciones,
    configActiva,
    setConfigActiva,
    agregarConfiguracion,
    eliminarConfiguracion,
    editarConfiguracion,
  } = useConfigStore();

  const pantallaActual = useConfigStore((state) => state.pantallaActual);
  const setPantallaActual = useConfigStore((state) => state.setPantallaActual);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [configParaEditar, setConfigParaEditar] = useState<ConfigPomodoro | null>(null);

  const abrirParaNuevo = () => {
    setConfigParaEditar(null);
    setModalAbierto(true);
  };

  const abrirParaEditar = (config: ConfigPomodoro) => {
    setConfigParaEditar(config);
    setModalAbierto(true);
  };

  const abrirParaEliminar = (config: ConfigPomodoro) => {
    setConfigActiva(config);
    setModalEliminarAbierto(true);
  };

  const manejarGuardado = (config: ConfigPomodoro) => {
    if (configParaEditar) {
      editarConfiguracion(config);
    } else {
      agregarConfiguracion(config);
    }
  };

  return (
    <section className="flex flex-col justify-between h-full p-8 bg-custom-sidebar transition-colors duration-300">
      <div className="opcionesLinks">
        <ul className="space-y-6 mt-4">
          {/* BOTÓN 0: Reloj */}
          <li className="flex items-center gap-4 cursor-pointer group" onClick={() => setPantallaActual("reloj")}>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
              ${
                pantallaActual === "reloj"
                  ? "bg-[#EC4166] text-white shadow-[0_0_20px_rgba(236,65,102,0.4)]"
                  : "bg-custom-bg text-custom-text/50 group-hover:bg-custom-bg/80"
              }
            `}
            >
              <FiClock size={26} />
            </div>
            <h3
              className={`font-bold text-xl tracking-wide transition-colors ${pantallaActual === "reloj" ? "text-custom-text" : "text-custom-text/40"}`}
            >
              Reloj
            </h3>
          </li>

          <li className="flex items-center gap-4 cursor-pointer group" onClick={() => setPantallaActual("calendario")}>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
              ${
                pantallaActual === "calendario"
                  ? "bg-[#EC4166] text-white shadow-[0_0_20px_rgba(236,65,102,0.4)]"
                  : "bg-custom-bg text-custom-text/50 group-hover:bg-custom-bg/80"
              }
            `}
            >
              <FiCalendar size={26} />
            </div>
            <h3
              className={`font-bold text-xl tracking-wide transition-colors ${pantallaActual === "calendario" ? "text-custom-text" : "text-custom-text/40"}`}
            >
              Calendario
            </h3>
          </li>

          <li
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => setPantallaActual("estadisticas")}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
              ${
                pantallaActual === "estadisticas"
                  ? "bg-[#EC4166] text-white shadow-[0_0_20px_rgba(236,65,102,0.4)]"
                  : "bg-custom-bg text-custom-text/50 group-hover:bg-custom-bg/80"
              }
            `}
            >
              <MdAutoGraph size={26} />
            </div>
            <h3
              className={`font-bold text-xl tracking-wide transition-colors ${pantallaActual === "estadisticas" ? "text-custom-text" : "text-custom-text/40"}`}
            >
              Estadísticas
            </h3>
          </li>

          <li className="flex items-center gap-4 cursor-pointer group" onClick={() => setPantallaActual("historial")}>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
    ${
      pantallaActual === "historial"
        ? "bg-[#EC4166] text-white shadow-[0_0_20px_rgba(236,65,102,0.4)]"
        : "bg-custom-bg text-custom-text/50 group-hover:bg-custom-bg/80"
    }
  `}
            >
              <FaClipboardList size={26} />
            </div>
            <h3
              className={`font-bold text-xl tracking-wide transition-colors ${
                pantallaActual === "historial" ? "text-custom-text" : "text-custom-text/40"
              }`}
            >
              Historial
            </h3>
          </li>

          <li
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => setPantallaActual("configuracion")}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
              ${
                pantallaActual === "configuracion"
                  ? "bg-[#EC4166] text-white shadow-[0_0_20px_rgba(236,65,102,0.4)]"
                  : "bg-custom-bg text-custom-text/50 group-hover:bg-custom-bg/80"
              }
            `}
            >
              <FiSettings size={26} />
            </div>
            <h3
              className={`font-bold text-xl tracking-wide transition-colors ${pantallaActual === "configuracion" ? "text-custom-text" : "text-custom-text/40"}`}
            >
              Configuración
            </h3>
          </li>
        </ul>
      </div>

      {/* SECCIÓN PREAJUSTES */}
      <div className="mt-10">
        <button
          onClick={abrirParaNuevo}
          className="w-full flex items-center justify-between px-6 py-4 rounded-[1.2rem] bg-custom-bg border border-white/5 shadow-sm text-sm font-bold text-custom-text/40 hover:bg-custom-bg/80 transition-all mb-4"
        >
          NUEVO PREAJUSTE <span className="text-xl font-light">+</span>
        </button>

        <div className="flex flex-col gap-3 overflow-y-auto max-h-[30vh] pr-2 scrollbar-thin">
          {listaConfiguraciones.map((config) => (
            <div
              key={config.id}
              onClick={() => setConfigActiva(config)}
              className={`flex justify-between items-center px-5 py-4 rounded-[1.2rem] cursor-pointer transition-all border
                ${
                  configActiva?.id === config.id
                    ? "bg-custom-bg shadow-inner border-white/10"
                    : "bg-transparent border-transparent hover:bg-custom-bg/30"
                }
              `}
            >
              <span
                className={`font-semibold ${configActiva?.id === config.id ? "text-custom-text" : "text-custom-text/50"}`}
              >
                {config.nombre}
              </span>

              <div className="flex gap-3 text-custom-text/20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirParaEditar(config);
                  }}
                  className="hover:text-custom-text transition-colors"
                  title="Editar"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirParaEliminar(config);
                  }}
                  className="hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALES */}
      <ModalConfig
        estaAbierto={modalAbierto}
        cerrarModal={() => setModalAbierto(false)}
        alGuardar={manejarGuardado}
        configAEditar={configParaEditar}
      />

      <ModalEliminar
        estaAbierto={modalEliminarAbierto}
        alCancelar={() => setModalEliminarAbierto(false)}
        alAceptar={() => {
          eliminarConfiguracion(configActiva.id);
          setModalEliminarAbierto(false);
        }}
        nombreConfigAEliminar={configActiva?.nombre}
      />
    </section>
  );
}
