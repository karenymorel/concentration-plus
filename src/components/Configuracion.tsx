import { useConfigStore } from "../store/useConfigStore";
import { FaBell, FaVolumeUp } from "react-icons/fa";

export default function Configuracion() {
  const { sonidoHabilitado, notificacionesHabilitadas, toggleSonido, toggleNotificaciones } = useConfigStore();

  return (
    <section className="flex flex-col items-center w-full h-full p-8 animate-fade-in bg-custom-bg">
      <div className="w-full max-w-2xl bg-custom-sidebar rounded-3xl shadow-2xl border border-white/5 p-8 mt-10">
        <h2 className="text-3xl font-bold text-custom-text mb-8 border-b border-white/10 pb-4">Ajustes Generales ⚙️</h2>

        <div className="space-y-6">
          {/* OPCIÓN 1: SONIDO */}
          <div className="flex items-center justify-between p-4 bg-custom-bg rounded-2xl border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EC4166]/10 text-[#EC4166] rounded-xl flex items-center justify-center">
                <FaVolumeUp size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-custom-text">Sonido de Alarma</h3>
                <p className="text-sm text-custom-text/60">Reproducir sonido al finalizar.</p>
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
                <h3 className="font-bold text-lg text-custom-text">Notificaciones</h3>
                <p className="text-sm text-custom-text/60">Alertas nativas del sistema.</p>
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
        </div>
      </div>
    </section>
  );
}
