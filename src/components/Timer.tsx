import { useState, useEffect } from "react";
import { FaPlay, FaPause, FaStop, FaUndoAlt } from "react-icons/fa";
import { ConfigPomodoro } from "../models/ConfigPomodoro";
import { useConfigStore } from "../store/useConfigStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface TimerProps {
  configuracion: ConfigPomodoro | null;
}

export default function Timer({ configuracion }: TimerProps) {
  const { t } = useTranslation();

  if (!configuracion) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-bold text-custom-text/50">{t("timer.sin_configuracion_titulo")} </h2>
        <p className="text-custom-text/30 mt-2">{t("timer.sin_configuracion_desc")}</p>
      </div>
    );
  }

  const tiempo_trabajo = configuracion.tiempo_trabajo * 60;
  const tiempo_corto_descanso = configuracion.tiempo_corto_descanso * 60;
  const tiempo_largo_descanso = configuracion.tiempo_largo_descanso * 60;

  const [modo, setModo] = useState<"trabajo" | "descanso_corto" | "descanso_largo">("trabajo");
  const [ciclos, setCiclos] = useState(0);
  const [tiempoSobra, setTiempoSobra] = useState(tiempo_trabajo);
  const [estaActivo, setEstaActivo] = useState(false);

  const guardarRegistro = useConfigStore((state) => state.guardarRegistro);
  const googleAccessToken = useConfigStore((state) => state.googleAccessToken);
  const sonidoHabilitado = useConfigStore((state) => state.sonidoHabilitado);
  const notificacionesHabilitadas = useConfigStore((state) => state.notificacionesHabilitadas);

  // --- MATEMÁTICAS DEL SVG ---
  const radio = 160;
  const strokeWidth = 26;
  const circunferencia = 2 * Math.PI * radio;

  const obtenerTiempoTotal = () => {
    if (modo === "trabajo") return tiempo_trabajo;
    if (modo === "descanso_corto") return tiempo_corto_descanso;
    return tiempo_largo_descanso;
  };

  const porcentaje_tiempo = tiempoSobra / (obtenerTiempoTotal() || 1);
  const strokeDashoffset = -((1 - porcentaje_tiempo) * circunferencia);

  const enviarNotificacion = (mensaje: string) => {
    toast.success(mensaje, {
      description: t("timer.notificaciones.sigue_asi"),
      icon: modo === "trabajo" ? "☕" : "🚀",
    });

    if (!notificacionesHabilitadas) return;
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Concentration PLUS", { body: mensaje });
    }
  };

  // GOOGLE CALENDAR
  const guardarEnGoogleCalendar = async () => {
    if (!googleAccessToken) return;
    const fechaFin = new Date();
    const fechaInicio = new Date(fechaFin.getTime() - configuracion.tiempo_trabajo * 60000);

    const eventoGCal = {
      summary: `🍅 Pomodoro: ${configuracion.nombre}`,
      description: "Sesión de enfoque completada.",
      start: { dateTime: fechaInicio.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end: { dateTime: fechaFin.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    };

    try {
      await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: { Authorization: `Bearer ${googleAccessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(eventoGCal),
      });
    } catch (error) {
      console.error("Error GCal:", error);
    }
  };

  useEffect(() => {
    setEstaActivo(false);
    setModo("trabajo");
    setTiempoSobra(configuracion.tiempo_trabajo * 60);
    setCiclos(0);
  }, [configuracion]);

  const botonPlayPausa = () => {
    if (!estaActivo && "Notification" in window && Notification.permission === "default" && notificacionesHabilitadas) {
      Notification.requestPermission();
    }
    setEstaActivo(!estaActivo);
  };

  const botonReset = () => {
    setEstaActivo(false);
    setTiempoSobra(obtenerTiempoTotal());
  };

  const botonStop = () => {
    const estabaCorriendo = estaActivo;
    setEstaActivo(false);

    toast.warning(t("timer.stop.titulo"), {
      description: "Se guardará el tiempo parcial en el historial.",
      duration: Infinity,
      action: {
        label: t("timer.stop.confirmar"),
        onClick: () => {
          const minutosRealizados = Math.ceil((tiempo_trabajo - tiempoSobra) / 60);

          if (minutosRealizados > 0 && modo === "trabajo") {
            guardarRegistro({
              minutos: minutosRealizados,
              minutosDescanso: 0,
              completado: false,
              nombreModo: configuracion.nombre,
            });
          }

          setModo("trabajo");
          setTiempoSobra(tiempo_trabajo);
          setCiclos(0);
          toast.error(t("timer.stop.exito"));
        },
      },
      cancel: {
        label: t("timer.stop.cancelar"),
        onClick: () => {
          if (estabaCorriendo) setEstaActivo(true);
          toast.dismiss();
        },
      },
    });
  };

  const cambiarModoAutomaticamente = () => {
    if (modo === "trabajo") {
      const nuevosCiclos = ciclos + 1;
      setCiclos(nuevosCiclos);

      const esDescansoLargo = nuevosCiclos % configuracion.ciclos_hasta_descanso_largo === 0;

      guardarRegistro({
        minutos: configuracion.tiempo_trabajo,
        minutosDescanso: esDescansoLargo ? configuracion.tiempo_largo_descanso : configuracion.tiempo_corto_descanso,
        completado: true,
        nombreModo: configuracion.nombre,
      });

      guardarEnGoogleCalendar();

      if (esDescansoLargo) {
        setModo("descanso_largo");
        setTiempoSobra(tiempo_largo_descanso);
        enviarNotificacion("¡Excelente trabajo! Descanso largo. ☕");
      } else {
        setModo("descanso_corto");
        setTiempoSobra(tiempo_corto_descanso);
        enviarNotificacion("¡Buen enfoque! Respiro corto. 🧘");
      }
    } else {
      setModo("trabajo");
      setTiempoSobra(tiempo_trabajo);
      enviarNotificacion("¡Fin del descanso! A trabajar. 🚀");
    }
  };

  useEffect(() => {
    let interval: number | null = null;
    if (estaActivo && tiempoSobra > 0) {
      interval = window.setInterval(() => {
        setTiempoSobra((prevTime) => prevTime - 1);
      }, 1000);
    } else if (estaActivo && tiempoSobra === 0) {
      if (sonidoHabilitado) {
        new Audio("/sounds/notification_01.mp3").play().catch(() => {});
      }
      cambiarModoAutomaticamente();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [estaActivo, tiempoSobra]);

  return (
    <section className="flex flex-col justify-center items-center gap-4 md:gap-8 w-full min-h-full bg-custom-bg transition-colors duration-300 p-4 md:p-6">
      {/* TÍTULOS RESPONSIVOS */}
      <div className="flex flex-col items-center mt-8 md:mt-0">
        <h2
          className={`text-4xl md:text-6xl font-bold uppercase tracking-widest transition-colors duration-500 text-center
          ${modo === "trabajo" ? "text-[#EC4166]" : "text-[#72c1d9]"}`}
        >
          {t(`timer.modos.${modo}`)}
        </h2>
        <span className="text-sm md:text-lg font-semibold text-custom-text opacity-60 mt-1 md:mt-2">
          {t("timer.ciclo")} {ciclos + 1}
        </span>
      </div>

      {/* RELOJ RESPONSIVO */}
      {/* En móvil: w-72 h-72 (288px). En PC: w-[25rem] h-[25rem] (400px) */}
      <div className="relative flex items-center justify-center w-72 h-72 md:w-[25rem] md:h-[25rem] my-4 md:my-0">
        <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 400 400" style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id="gradienteTrabajo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff8a9d" />
              <stop offset="100%" stopColor="#EC4166" />
            </linearGradient>
            <linearGradient id="gradienteDescanso" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#72c1d9" />
              <stop offset="100%" stopColor="#4a9fb8" />
            </linearGradient>
          </defs>

          {/* Carril de fondo */}
          <circle cx="200" cy="200" r={radio} fill="none" className="stroke-white/5" strokeWidth={strokeWidth} />

          {/* Círculo de progreso (Neón) */}
          <circle
            cx="200"
            cy="200"
            r={radio}
            fill="none"
            stroke={modo === "trabajo" ? "url(#gradienteTrabajo)" : "url(#gradienteDescanso)"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter:
                modo === "trabajo"
                  ? "drop-shadow(0 0 12px rgba(236, 65, 102, 0.5))"
                  : "drop-shadow(0 0 12px rgba(114, 193, 217, 0.5))",
            }}
          />
        </svg>

        {/* Texto del tiempo central responsivo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl md:text-8xl text-custom-text font-extralight tracking-tighter">
            {formatoTiempo(tiempoSobra)}
          </span>
        </div>
      </div>

      {/* 🔘 BOTONES RESPONSIVOS */}
      <div className="flex gap-6 md:gap-10 items-center mt-2">
        <button
          onClick={botonReset}
          className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-custom-sidebar text-custom-text/40 shadow-lg hover:text-custom-text hover:scale-110 transition-all border border-white/5"
        >
          <FaUndoAlt size={20} className="md:w-[24px] md:h-[24px]" />
        </button>

        <button
          onClick={botonPlayPausa}
          className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-custom-sidebar border border-white/10 hover:scale-110 transition-all shadow-2xl"
        >
          {estaActivo ? (
            <FaPause
              size={28}
              className={`md:w-[32px] md:h-[32px] ${modo === "trabajo" ? "text-[#EC4166]" : "text-[#72c1d9]"}`}
            />
          ) : (
            <FaPlay
              size={28}
              className={`ml-2 md:w-[32px] md:h-[32px] ${modo === "trabajo" ? "text-[#EC4166]" : "text-[#72c1d9]"}`}
            />
          )}
        </button>

        <button
          onClick={botonStop}
          className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-custom-sidebar text-custom-text/40 shadow-lg hover:text-red-500 hover:scale-110 transition-all border border-white/5"
        >
          <FaStop size={20} className="md:w-[24px] md:h-[24px]" />
        </button>
      </div>
    </section>
  );
}

const formatoTiempo = (segundos: number) => {
  const mins = Math.floor(segundos / 60);
  const secs = segundos % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
