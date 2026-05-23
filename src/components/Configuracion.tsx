import { useConfigStore } from "../store/useConfigStore";
import { FaBell, FaVolumeUp, FaGlobe } from "react-icons/fa"; // Agregamos FaGlobe
import { useTranslation } from "react-i18next";
import IdiomaToggle from "./IdiomaToggle"; // Importamos tu selector de idiomas

export default function Configuracion() {
  const { sonidoHabilitado, notificacionesHabilitadas, toggleSonido, toggleNotificaciones } = useConfigStore();
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center w-full h-full p-8 animate-fade-in bg-custom-bg">
      <div className="w-full max-w-2xl bg-custom-sidebar rounded-3xl shadow-2xl border border-white/5 p-8 mt-10">
        <h2 className="text-3xl font-bold text-custom-text mb-8 border-b border-white/10 pb-4">
          {t("configuracion.titulo")}
        </h2>

        <div className="space-y-6">
          {/* OPCIÓN 1: SONIDO */}
          <div className="flex items-center justify-between p-4 bg-custom-bg rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EC4166]/10 text-[#EC4166] rounded-xl flex items-center justify-center">
                <FaVolumeUp size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-custom-text">{t("configuracion.sonido_titulo")} </h3>
                <p className="text-sm text-custom-text/60">{t("configuracion.sonido_desc")}</p>
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-lg"
              style={{
                backgroundColor: sonidoHabilitado ? "#EC4166" : "#555",
                borderColor: sonidoHabilitado ? "#EC4166" : "#555",
              }}
              checked={sonidoHabilitado}
              onChange={toggleSonido}
            />
          </div>

          {/* OPCIÓN 2: NOTIFICACIONES */}
          <div className="flex items-center justify-between p-4 bg-custom-bg rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#72c1d9]/10 text-[#72c1d9] rounded-xl flex items-center justify-center">
                <FaBell size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-custom-text">{t("configuracion.notif_titulo")}</h3>
                <p className="text-sm text-custom-text/60">{t("configuracion.notif_desc")}</p>
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-lg"
              style={{
                backgroundColor: notificacionesHabilitadas ? "#72c1d9" : "#555",
                borderColor: notificacionesHabilitadas ? "#72c1d9" : "#555",
              }}
              checked={notificacionesHabilitadas}
              onChange={toggleNotificaciones}
            />
          </div>

          {/* OPCIÓN 3: IDIOMA */}
          <div className="flex items-center justify-between p-4 bg-custom-bg rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#6a81f2]/10 text-[#6a81f2] rounded-xl flex items-center justify-center">
                <FaGlobe size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-custom-text">{t("configuracion.idioma_titulo")}</h3>
                <p className="text-sm text-custom-text/60">{t("configuracion.idioma_desc")}</p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <IdiomaToggle />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
