import { useState, useEffect } from "react";
import { ConfigPomodoro } from "../models/ConfigPomodoro";
import { useTranslation } from "react-i18next";

interface ModalConfigProps {
  estaAbierto: boolean;
  cerrarModal: () => void;
  alGuardar: (nuevaConfig: ConfigPomodoro) => void;
  configAEditar?: ConfigPomodoro | null;
}

export default function ModalConfig({ estaAbierto, cerrarModal, alGuardar, configAEditar }: ModalConfigProps) {
  const [nombre, setNombre] = useState("");
  const [trabajo, setTrabajo] = useState(25);
  const [descansoCorto, setDescansoCorto] = useState(5);
  const [descansoLargo, setDescansoLargo] = useState(15);
  const [ciclos, setCiclos] = useState(4);
  const [errorNombre, setErrorNombre] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (estaAbierto) {
      if (configAEditar) {
        setNombre(configAEditar.nombre);
        setTrabajo(configAEditar.tiempo_trabajo);
        setDescansoCorto(configAEditar.tiempo_corto_descanso);
        setDescansoLargo(configAEditar.tiempo_largo_descanso);
        setCiclos(configAEditar.ciclos_hasta_descanso_largo);
      } else {
        setNombre("");
        setTrabajo(25);
        setDescansoCorto(5);
        setDescansoLargo(15);
        setCiclos(4);
      }
      setErrorNombre(false);
    }
  }, [estaAbierto, configAEditar]);

  const botonGuardar = () => {
    if (nombre.trim() === "") {
      setErrorNombre(true);
      return;
    }

    const nuevaConfig: ConfigPomodoro = {
      id: configAEditar ? configAEditar.id : Date.now().toString(),
      nombre: nombre,
      tiempo_trabajo: trabajo,
      tiempo_corto_descanso: descansoCorto,
      tiempo_largo_descanso: descansoLargo,
      ciclos_hasta_descanso_largo: ciclos,
    };

    alGuardar(nuevaConfig);
    cerrarModal();
  };

  const cancelarYcerrar = () => {
    setErrorNombre(false);
    cerrarModal();
  };

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex justify-center items-center animate-fade-in p-4">
      <div className="bg-custom-sidebar rounded-3xl p-8 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative transition-colors duration-300">
        {/* TÍTULO */}
        <h3 className="font-bold text-2xl mb-6 text-custom-text">
          {configAEditar ? t("modals.config.titulo_editar") : t("modals.config.titulo_nuevo")}
        </h3>

        <div className="space-y-5">
          {/* NOMBRE */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-custom-text/60 ml-1">{t("modals.config.nombre_label")} </label>
            <input
              type="text"
              placeholder={t("modals.config.nombre_placeholder")}
              className={`w-full px-4 py-3 rounded-xl bg-custom-bg text-custom-text border transition-all outline-none
                ${errorNombre ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "border-white/5 focus:border-[#EC4166]/50"}`}
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errorNombre) setErrorNombre(false);
              }}
            />
            {errorNombre && (
              <span className="text-red-400 text-xs mt-1 ml-1 font-medium">{t("modals.config.nombre_error")} </span>
            )}
          </div>

          {/* TIEMPOS FILA 1 */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-xs font-bold text-custom-text/40 uppercase tracking-wider ml-1">
                {t("modals.config.trabajo_label")} (min)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-custom-bg text-custom-text border border-white/5 focus:border-[#EC4166]/50 outline-none transition-all"
                value={trabajo}
                onChange={(e) => setTrabajo(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-xs font-bold text-custom-text/40 uppercase tracking-wider ml-1">
                {t("modals.config.descanso_corto_label")} (min)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-custom-bg text-custom-text border border-white/5 focus:border-[#EC4166]/50 outline-none transition-all"
                value={descansoCorto}
                onChange={(e) => setDescansoCorto(Number(e.target.value))}
              />
            </div>
          </div>

          {/* TIEMPOS FILA 2 */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-xs font-bold text-custom-text/40 uppercase tracking-wider ml-1">
                {t("modals.config.descanso_largo_label")} (min)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-custom-bg text-custom-text border border-white/5 focus:border-[#EC4166]/50 outline-none transition-all"
                value={descansoLargo}
                onChange={(e) => setDescansoLargo(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-xs font-bold text-custom-text/40 uppercase tracking-wider ml-1">
                {t("modals.config.ciclos_label")}
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-custom-bg text-custom-text border border-white/5 focus:border-[#EC4166]/50 outline-none transition-all"
                value={ciclos}
                onChange={(e) => setCiclos(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="mt-10 flex justify-end gap-3">
          <button
            onClick={cancelarYcerrar}
            className="px-6 py-3 rounded-xl font-bold text-custom-text/50 hover:bg-white/5 hover:text-custom-text transition-all"
          >
            {t("modals.config.btn_cancelar")}
          </button>
          <button
            onClick={botonGuardar}
            className="px-8 py-3 rounded-xl font-bold text-white bg-neutral static-gradiente shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            {configAEditar ? t("modals.config.btn_actualizar") : t("modals.config.btn_crear")}
          </button>
        </div>
      </div>
    </div>
  );
}
