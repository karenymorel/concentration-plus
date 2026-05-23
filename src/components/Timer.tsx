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

  const tiempo_trabajo = configuracion ? configuracion.tiempo_trabajo * 60 : 0;
  const tiempo_corto_descanso = configuracion ? configuracion.tiempo_corto_descanso * 60 : 0;
  const tiempo_largo_descanso = configuracion ? configuracion.tiempo_largo_descanso * 60 : 0;

  const [ciclos, setCiclos] = useState(0);
  const [tiempoSobra, setTiempoSobra] = useState(configuracion ? configuracion.tiempo_trabajo * 60 : 0);
  const estaActivo = useConfigStore((state) => state.estaActivo);
  const setEstaActivo = useConfigStore((state) => state.setEstaActivo);
  const guardarRegistro = useConfigStore((state) => state.guardarRegistro);
  const googleAccessToken = useConfigStore((state) => state.googleAccessToken);
  const sonidoHabilitado = useConfigStore((state) => state.sonidoHabilitado);
  const notificacionesHabilitadas = useConfigStore((state) => state.notificacionesHabilitadas);
  const modo = useConfigStore((state) => state.modo);
  const setModo = useConfigStore((state) => state.setModo);
  const setSesionEnCurso = useConfigStore((state) => state.setSesionEnCurso);

  useEffect(() => {
    if (!configuracion) return;
    setEstaActivo(false);
    setSesionEnCurso(false);
    setModo("trabajo");
    setTiempoSobra(configuracion.tiempo_trabajo * 60);
    setCiclos(0);
  }, [configuracion]);

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

  if (!configuracion) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-2xl font-bold text-custom-text/50">{t("timer.sin_configuracion_titulo")} </h2>
        <p className="text-custom-text/30 mt-2">{t("timer.sin_configuracion_desc")}</p>
      </div>
    );
  }

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

  const botonPlayPausa = () => {
    if (!estaActivo) {
      setSesionEnCurso(true);
    }
    if (!estaActivo && "Notification" in window && Notification.permission === "default" && notificacionesHabilitadas) {
      Notification.requestPermission();
    }
    setEstaActivo(!estaActivo);
  };

  const botonReset = () => {
    toast.warning(t("confirmaciones.reiniciar_bloque.titulo"), {
      description: t("confirmaciones.reiniciar_bloque.desc"),
      action: {
        label: t("confirmaciones.reiniciar_bloque.confirmar"),
        onClick: () => {
          setEstaActivo(false);
          setTiempoSobra(obtenerTiempoTotal());
          toast.dismiss();
          setSesionEnCurso(false);
        },
      },
      cancel: {
        label: t("confirmaciones.reiniciar_bloque.cancelar"),
        onClick: () => toast.dismiss(),
      },
    });
  };

  const botonStop = () => {
    const estabaCorriendo = estaActivo;
    setEstaActivo(false);

    toast.warning(t("timer.stop.titulo"), {
      description: t("timer.stop.desc"),
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
          setSesionEnCurso(false);
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

  return (
    <section className="flex flex-col justify-center items-center gap-[clamp(1rem,4vmin,2.5rem)] w-full h-full max-h-full overflow-hidden bg-transparent">
      <div className="flex flex-col items-center flex-shrink-0">
        <h2
          className={`font-bold uppercase tracking-widest transition-colors duration-500 text-center text-[clamp(1.8rem,5vmin,4rem)]
          ${modo === "trabajo" ? "text-[#EC4166]" : modo === "descanso_corto" ? "text-[#72c1d9]" : "text-[#6a81f2]"}`}
        >
          {t(`timer.modos.${modo}`)}
        </h2>
        <span className="font-semibold text-custom-text opacity-60 mt-1 text-[clamp(0.875rem,2vmin,1.25rem)]">
          {t("timer.ciclo")} {ciclos + 1}
        </span>
      </div>

      <div className="relative flex items-center justify-center w-[clamp(14rem,48vmin,28rem)] h-[clamp(14rem,48vmin,28rem)] flex-shrink-0 my-2">
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
            <linearGradient id="gradienteDescansoLargo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6a81f2" />
              <stop offset="100%" stopColor="#3347a0" />
            </linearGradient>
          </defs>

          <circle cx="200" cy="200" r={radio} fill="none" className="stroke-white/5" strokeWidth={strokeWidth} />

          {/* Círculo de progreso */}
          <circle
            cx="200"
            cy="200"
            r={radio}
            fill="none"
            stroke={
              modo === "trabajo"
                ? "url(#gradienteTrabajo)"
                : modo === "descanso_corto"
                  ? "url(#gradienteDescanso)"
                  : "url(#gradienteDescansoLargo)"
            }
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter:
                modo === "trabajo"
                  ? "drop-shadow(0 0 12px rgba(236, 65, 102, 0.5))"
                  : modo === "descanso_corto"
                    ? "drop-shadow(0 0 12px rgba(114, 193, 217, 0.5))"
                    : "drop-shadow(0 0 12px rgba(114, 193, 217,0.5))",
            }}
          />
        </svg>

        {/* Texto del tiempo - Max 7rem (antes 6rem) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-custom-text font-extralight tracking-tighter text-[clamp(3.5rem,12vmin,7rem)]">
            {formatoTiempo(tiempoSobra)}
          </span>
        </div>
      </div>

      {/* 🔘 BOTONES FLUIDOS */}
      <div className="flex items-center gap-[clamp(1rem,4vmin,2.5rem)] flex-shrink-0 mt-2">
        <button
          onClick={botonReset}
          className="flex items-center justify-center rounded-full bg-custom-sidebar text-custom-text/40 shadow-lg hover:text-custom-text hover:scale-110 transition-all border border-white/5 w-[clamp(3rem,9vmin,4.5rem)] h-[clamp(3rem,9vmin,4.5rem)]"
        >
          <FaUndoAlt className="w-[clamp(1.2rem,3vmin,1.6rem)] h-[clamp(1.2rem,3vmin,1.6rem)]" />
        </button>

        <button
          onClick={botonPlayPausa}
          className="flex items-center justify-center rounded-full bg-custom-sidebar border border-white/10 hover:scale-110 transition-all shadow-2xl w-[clamp(4.5rem,13vmin,7rem)] h-[clamp(4.5rem,13vmin,7rem)]"
        >
          {estaActivo ? (
            <FaPause
              className={`w-[clamp(1.5rem,5.5vmin,2.2rem)] h-[clamp(1.5rem,5.5vmin,2.2rem)] ${modo === "trabajo" ? "text-[#EC4166]" : modo === "descanso_corto" ? "text-[#72c1d9]" : "text-[#6a81f2]"}`}
            />
          ) : (
            <FaPlay
              className={`ml-[clamp(0.2rem,1vmin,0.5rem)] w-[clamp(1.5rem,5.5vmin,2.2rem)] h-[clamp(1.5rem,5.5vmin,2.2rem)] ${modo === "trabajo" ? "text-[#EC4166]" : "text-[#72c1d9]"}`}
            />
          )}
        </button>

        <button
          onClick={botonStop}
          className="flex items-center justify-center rounded-full bg-custom-sidebar text-custom-text/40 shadow-lg hover:text-red-500 hover:scale-110 transition-all border border-white/5 w-[clamp(3rem,9vmin,4.5rem)] h-[clamp(3rem,9vmin,4.5rem)]"
        >
          <FaStop className="w-[clamp(1.2rem,3vmin,1.6rem)] h-[clamp(1.2rem,3vmin,1.6rem)]" />
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
