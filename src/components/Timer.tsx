import { useState, useEffect } from "react";
import { FaPlay, FaPause, FaStop, FaUndoAlt } from "react-icons/fa";
import { ConfigPomodoro } from "../models/ConfigPomodoro";
import { useConfigStore } from "../store/useConfigStore";
import { toast } from "sonner";

interface TimerProps {
  configuracion: ConfigPomodoro;
}

export default function Timer({ configuracion }: TimerProps) {
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

  // 🧮 --- MATEMÁTICAS DEL SVG ---
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

  // NOTIFICACIONES
  const enviarNotificacion = (mensaje: string) => {
    toast.success(mensaje, {
      description: "¡Sigue así!",
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

    toast.warning("¿Detener sesión completa?", {
      description: "Se guardará el tiempo parcial en el historial.",
      duration: Infinity,
      action: {
        label: "Sí, detener",
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
          toast.error("Sesión detenida y guardada en bitácora");
        },
      },
      cancel: {
        label: "No, continuar",
        onClick: () => {
          if (estabaCorriendo) setEstaActivo(true);
          toast.dismiss();
        },
      },
    });
  };

  // 🐛 SOLUCIÓN DEL BUG AQUÍ
  const cambiarModoAutomaticamente = () => {
    if (modo === "trabajo") {
      // 1. Aumentamos los ciclos primero
      const nuevosCiclos = ciclos + 1;
      setCiclos(nuevosCiclos);

      // 2. Comprobamos si toca descanso largo con los ciclos nuevos
      const esDescansoLargo = nuevosCiclos % configuracion.ciclos_hasta_descanso_largo === 0;

      // 3. Guardamos en el store local
      guardarRegistro({
        minutos: configuracion.tiempo_trabajo,
        minutosDescanso: esDescansoLargo ? configuracion.tiempo_largo_descanso : configuracion.tiempo_corto_descanso,
        completado: true,
        nombreModo: configuracion.nombre,
      });

      // 4. Guardamos en Google Calendar
      guardarEnGoogleCalendar();

      // 5. Cambiamos de modo y notificamos
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
    <section className="flex flex-col justify-center items-center gap-4 w-full min-h-full bg-custom-bg transition-colors duration-300 p-6">
      {/* TÍTULOS */}
      <div className="flex flex-col items-center">
        <h2
          className={`text-6xl font-bold uppercase tracking-widest transition-colors duration-500
          ${modo === "trabajo" ? "text-[#EC4166]" : "text-[#72c1d9]"}`}
        >
          {modo.replace("_", " ")}
        </h2>
        <span className="text-lg font-semibold text-custom-text opacity-60 mt-2">CICLO #{ciclos + 1}</span>
      </div>

      {/* RELOJ */}
      <div className="relative flex items-center justify-center w-[25rem] h-[25rem]">
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

        {/* Texto del tiempo central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-8xl text-custom-text font-extralight tracking-tighter">
            {formatoTiempo(tiempoSobra)}
          </span>
        </div>
      </div>

      {/* 🔘 BOTONES */}
      <div className="flex gap-10 items-center mt-4">
        <button
          onClick={botonReset}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-custom-sidebar text-custom-text/40 shadow-lg hover:text-custom-text hover:scale-110 transition-all border border-white/5"
        >
          <FaUndoAlt size={24} />
        </button>

        <button
          onClick={botonPlayPausa}
          className={`w-24 h-24 flex items-center justify-center rounded-full bg-custom-sidebar border border-white/10 hover:scale-110 transition-all shadow-2xl`}
        >
          {estaActivo ? (
            <FaPause size={32} className={modo === "trabajo" ? "text-[#EC4166]" : "text-[#72c1d9]"} />
          ) : (
            <FaPlay size={32} className={`ml-2 ${modo === "trabajo" ? "text-[#EC4166]" : "text-[#72c1d9]"}`} />
          )}
        </button>

        <button
          onClick={botonStop}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-custom-sidebar text-custom-text/40 shadow-lg hover:text-red-500 hover:scale-110 transition-all border border-white/5"
        >
          <FaStop size={24} />
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
