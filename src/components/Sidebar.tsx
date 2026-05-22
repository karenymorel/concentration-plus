import { useState } from "react";
import { FiSettings, FiCalendar, FiClock, FiEdit2, FiTrash2 } from "react-icons/fi";
import { MdAutoGraph } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import ModalConfig from "./ModalConfig";
import ModalEliminar from "./ModalEliminar";
import { useConfigStore } from "../store/useConfigStore";
import { ConfigPomodoro } from "../models/ConfigPomodoro";
import IdiomaToggle from "./IdiomaToggle";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function Sidebar() {
  const { t } = useTranslation();
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
  const modo = useConfigStore((state) => state.modo);
  const colorAcento = modo === "trabajo" ? "#EC4166" : modo === "descanso_corto" ? "#72c1d9" : "#6a81f2";

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [configParaEditar, setConfigParaEditar] = useState<ConfigPomodoro | null>(null);
  const [configParaEliminar, setConfigParaEliminar] = useState<ConfigPomodoro | null>(null);

  const setEstaActivo = useConfigStore((state) => state.setEstaActivo);
  const sesionEnCurso = useConfigStore((state) => state.sesionEnCurso);
  const setSesionEnCurso = useConfigStore((state) => state.setSesionEnCurso);

  const abrirParaNuevo = () => {
    setConfigParaEditar(null);
    setModalAbierto(true);
  };

  const abrirParaEditar = (config: ConfigPomodoro) => {
    if (config.id === configActiva?.id && sesionEnCurso) {
      toast.warning(t("confirmaciones.editar_activo.titulo"), {
        description: t("confirmaciones.editar_activo.desc"),
        action: {
          label: t("confirmaciones.editar_activo.confirmar"),
          onClick: () => {
            setEstaActivo(false);
            setSesionEnCurso(false);
            setConfigParaEditar(config);
            setModalAbierto(true);
          },
        },
        cancel: {
          label: t("confirmaciones.editar_activo.cancelar"),
          onClick: () => toast.dismiss(),
        },
      });
    } else {
      setConfigParaEditar(config);
      setModalAbierto(true);
    }
  };

  const abrirParaEliminar = (config: ConfigPomodoro) => {
    setConfigParaEliminar(config);
    setModalEliminarAbierto(true);
  };

  const manejarGuardado = (config: ConfigPomodoro) => {
    if (configParaEditar) {
      editarConfiguracion(config);
    } else {
      agregarConfiguracion(config);
    }
  };

  const manejarCambioConfig = (config: ConfigPomodoro) => {
    if (sesionEnCurso && config.id !== configActiva?.id) {
      toast.warning(t("confirmaciones.cambiar_modo.titulo"), {
        description: t("confirmaciones.cambiar_modo.desc"),
        action: {
          label: t("confirmaciones.cambiar_modo.confirmar"),
          onClick: () => {
            setEstaActivo(false);
            setConfigActiva(config);
          },
        },
        cancel: {
          label: t("confirmaciones.cambiar_modo.cancelar"),
          onClick: () => toast.dismiss(),
        },
      });
    } else {
      setConfigActiva(config);
    }
  };

  return (
    <section className="flex flex-col justify-end md:justify-between h-full p-2 md:p-8 bg-custom-sidebar transition-colors duration-300">
      <div className="order-1 md:order-2 w-full mt-2 md:mt-10 mb-2 md:mb-0">
        <button
          onClick={abrirParaNuevo}
          className="hidden md:flex w-full items-center justify-between px-6 py-4 rounded-[1.2rem] bg-custom-bg border border-white/5 shadow-sm text-sm font-bold text-custom-text/40 hover:bg-custom-bg/80 transition-all mb-4"
        >
          {t("sidebar.new_preset")} <span className="text-xl font-light">+</span>
        </button>

        <div className="flex flex-row md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto max-h-[30vh] pb-2 md:pb-0 pr-2 scrollbar-thin w-full">
          {listaConfiguraciones.map((config) => (
            <div
              key={config.id}
              onClick={() => manejarCambioConfig(config)}
              className={`flex-shrink-0 flex justify-between items-center px-4 py-2 md:px-5 md:py-4 rounded-full md:rounded-[1.2rem] cursor-pointer transition-all border
                ${
                  configActiva?.id === config.id
                    ? "bg-custom-bg shadow-inner border-white/10"
                    : "bg-transparent border-white/5 md:border-transparent hover:bg-custom-bg/30"
                }
              `}
            >
              <span
                className={`font-semibold text-xs md:text-base whitespace-nowrap ${
                  configActiva?.id === config.id ? "text-custom-text" : "text-custom-text/50"
                }`}
              >
                {config.nombre}
              </span>

              <div className="hidden md:flex gap-3 text-custom-text/20">
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

      <div className="order-2 md:order-1 w-full border-t border-white/5 md:border-none pt-2 md:pt-0">
        <div className="flex justify-center mb-6">
          <IdiomaToggle />
        </div>
        <ul className="flex flex-row md:flex-col justify-around md:justify-start w-full md:space-y-6 mt-1 md:mt-4">
          {/* BOTÓN: Reloj */}
          <li
            className="flex flex-col md:flex-row items-center gap-1 md:gap-4 cursor-pointer group"
            onClick={() => setPantallaActual("reloj")}
          >
            <div
              style={{ backgroundColor: pantallaActual === "reloj" ? colorAcento : "" }}
              className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300
      ${
        pantallaActual === "reloj"
          ? "text-white shadow-lg"
          : "bg-transparent md:bg-custom-bg text-custom-text/50 group-hover:bg-custom-bg/80"
      }`}
            >
              <FiClock className="w-5 h-5 md:w-[26px] md:h-[26px]" />
            </div>

            <h3
              style={{ color: pantallaActual === "reloj" ? colorAcento : "" }}
              className={`font-bold text-[10px] md:text-xl tracking-wide transition-colors ${
                pantallaActual === "reloj" ? "md:text-custom-text" : "text-custom-text/40"
              }`}
            >
              {t("sidebar.timer")}
            </h3>
          </li>

          {/* BOTÓN: Calendario */}
          <li
            className="flex flex-col md:flex-row items-center gap-1 md:gap-4 cursor-pointer group"
            onClick={() => setPantallaActual("calendario")}
          >
            <div
              style={{
                backgroundColor: pantallaActual === "calendario" ? colorAcento : "",
              }}
              className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300
      ${
        pantallaActual === "calendario"
          ? "text-white shadow-lg"
          : "bg-transparent md:bg-custom-bg text-custom-text/50 group-hover:bg-custom-bg/80"
      }`}
            >
              <FiCalendar className="w-5 h-5 md:w-[26px] md:h-[26px]" />
            </div>

            <h3
              style={{
                color: pantallaActual === "calendario" ? colorAcento : "",
              }}
              className={`font-bold text-[10px] md:text-xl tracking-wide transition-colors ${
                pantallaActual === "calendario" ? "md:text-custom-text" : "text-custom-text/40"
              }`}
            >
              {t("sidebar.calendar")}
            </h3>
          </li>

          {/* BOTÓN: Estadísticas */}
          <li
            className="flex flex-col md:flex-row items-center gap-1 md:gap-4 cursor-pointer group"
            onClick={() => setPantallaActual("estadisticas")}
          >
            <div
              style={{
                backgroundColor: pantallaActual === "estadisticas" ? colorAcento : "",
              }}
              className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300
      ${
        pantallaActual === "estadisticas"
          ? "text-white shadow-lg"
          : "bg-transparent md:bg-custom-bg text-custom-text/50 group-hover:bg-custom-bg/80"
      }`}
            >
              <MdAutoGraph className="w-6 h-6 md:w-[26px] md:h-[26px]" />
            </div>

            <h3
              style={{
                color: pantallaActual === "estadisticas" ? colorAcento : "",
              }}
              className={`font-bold text-[10px] md:text-xl tracking-wide transition-colors ${
                pantallaActual === "estadisticas" ? "md:text-custom-text" : "text-custom-text/40"
              }`}
            >
              {t("sidebar.stats")}
            </h3>
          </li>

          {/* BOTÓN: Historial */}
          <li
            className="flex flex-col md:flex-row items-center gap-1 md:gap-4 cursor-pointer group"
            onClick={() => setPantallaActual("historial")}
          >
            <div
              style={{
                backgroundColor: pantallaActual === "historial" ? colorAcento : "",
              }}
              className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300
      ${
        pantallaActual === "historial"
          ? "text-white shadow-lg"
          : "bg-transparent md:bg-custom-bg text-custom-text/50 group-hover:bg-custom-bg/80"
      }`}
            >
              <FaClipboardList className="w-5 h-5 md:w-[26px] md:h-[26px]" />
            </div>

            <h3
              style={{
                color: pantallaActual === "historial" ? colorAcento : "",
              }}
              className={`font-bold text-[10px] md:text-xl tracking-wide transition-colors ${
                pantallaActual === "historial" ? "md:text-custom-text" : "text-custom-text/40"
              }`}
            >
              {t("sidebar.history")}
            </h3>
          </li>

          {/* BOTÓN: Configuración */}
          <li
            className="flex flex-col md:flex-row items-center gap-1 md:gap-4 cursor-pointer group"
            onClick={() => setPantallaActual("configuracion")}
          >
            <div
              style={{
                backgroundColor: pantallaActual === "configuracion" ? colorAcento : "",
              }}
              className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300
      ${
        pantallaActual === "configuracion"
          ? "text-white shadow-lg"
          : "bg-transparent md:bg-custom-bg text-custom-text/50 group-hover:bg-custom-bg/80"
      }`}
            >
              <FiSettings className="w-5 h-5 md:w-[26px] md:h-[26px]" />
            </div>

            <h3
              style={{
                color: pantallaActual === "configuracion" ? colorAcento : "",
              }}
              className={`font-bold text-[10px] md:text-xl tracking-wide transition-colors ${
                pantallaActual === "configuracion" ? "md:text-custom-text" : "text-custom-text/40"
              }`}
            >
              {t("sidebar.settings")}
            </h3>
          </li>
        </ul>
      </div>

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
          if (configParaEliminar) {
            eliminarConfiguracion(configParaEliminar.id);
          }
          setModalEliminarAbierto(false);
          setConfigParaEliminar(null);
        }}
        nombreConfigAEliminar={configParaEliminar?.nombre || "la configuración"}
      />
    </section>
  );
}
