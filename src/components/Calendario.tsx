import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useConfigStore } from "../store/useConfigStore";
import { FaGoogle, FaCalendarCheck, FaUnlink, FaSync } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface GoogleEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export default function Calendario() {
  const googleAccessToken = useConfigStore((state) => state.googleAccessToken);
  const setGoogleAccessToken = useConfigStore((state) => state.setGoogleAccessToken);
  const [eventosHoy, setEventosHoy] = useState<GoogleEvent[]>([]);
  const [cargando, setCargando] = useState(false);
  const { t } = useTranslation();

  const iniciarSesionGoogle = useGoogleLogin({
    onSuccess: (respuesta) => setGoogleAccessToken(respuesta.access_token),
    onError: (error) => console.error("Error:", error),
    scope: "https://www.googleapis.com/auth/calendar.events",
  });

  const cerrarSesion = () => {
    setGoogleAccessToken(null);
    setEventosHoy([]);
  };

  const obtenerEventosDeHoy = async () => {
    if (!googleAccessToken) return;
    setCargando(true);
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);

    try {
      const respuesta = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${hoyInicio.toISOString()}&timeMax=${hoyFin.toISOString()}&singleEvents=true&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${googleAccessToken}` } },
      );
      const datos = await respuesta.json();
      if (datos.error) {
        cerrarSesion();
        return;
      }
      setEventosHoy(datos.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (googleAccessToken) obtenerEventosDeHoy();
  }, [googleAccessToken]);

  const formatoHora = (fechaISO?: string) => {
    if (!fechaISO) return t("calendario.todo_el_dia");
    return new Date(fechaISO).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section className="flex flex-col items-center w-full h-full p-8 animate-fade-in overflow-y-auto bg-custom-bg">
      <div className="flex justify-between items-center w-full max-w-4xl mb-8">
        <h2 className="text-4xl font-bold text-custom-text">{t("calendario.titulo")}</h2>
        {googleAccessToken && (
          <button onClick={cerrarSesion} className="btn btn-ghost text-red-400 btn-sm gap-2">
            <FaUnlink /> {t("calendario.desconectar")}
          </button>
        )}
      </div>

      {!googleAccessToken ? (
        <div className="bg-custom-sidebar p-10 rounded-3xl shadow-2xl border border-white/5 text-center max-w-lg mt-10">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-[#EC4166]/10 text-[#EC4166] rounded-full flex items-center justify-center">
              <FaGoogle size={48} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-custom-text mb-4">{t("calendario.google_titulo")}</h2>
          <p className="text-custom-text/60 mb-6">{t("calendario.google_desc")}</p>
          <button
            onClick={() => iniciarSesionGoogle()}
            className="btn bg-[#4285F4] hover:bg-[#3367D6] text-white border-none w-full shadow-lg gap-3"
          >
            <FaGoogle /> {t("calendario.google_boton")}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-custom-sidebar rounded-3xl shadow-xl border border-white/5 p-8">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h3 className="text-2xl font-bold text-custom-text flex items-center gap-3">
              <FaCalendarCheck className="text-[#EC4166]" /> {t("calendario.eventos_hoy")}
            </h3>
            <button onClick={obtenerEventosDeHoy} className={`text-custom-text/60 ${cargando ? "animate-spin" : ""}`}>
              <FaSync size={20} />
            </button>
          </div>

          {cargando ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg text-[#EC4166]"></span>
            </div>
          ) : eventosHoy.length === 0 ? (
            <div className="text-center py-10 text-custom-text/30 italic">{t("calendario.sin_eventos")}</div>
          ) : (
            <div className="space-y-4">
              {eventosHoy.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-custom-bg hover:bg-custom-bg/80 transition-all border border-white/5"
                >
                  <div className="w-2 h-12 bg-[#EC4166] rounded-full"></div>
                  <div className="flex flex-col min-w-[100px]">
                    <span className="font-bold text-custom-text">{formatoHora(evento.start.dateTime)}</span>
                    <span className="text-xs text-custom-text/40">{formatoHora(evento.end.dateTime)}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-custom-text">{evento.summary || "Sin título"}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
