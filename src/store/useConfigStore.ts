import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ConfigPomodoro } from "../models/ConfigPomodoro";
import { RegistroPomodoro } from "../models/RegistroPomodoro";

interface ConfigState {
  listaConfiguraciones: ConfigPomodoro[];
  configActiva: ConfigPomodoro | null;
  setConfigActiva: (config: ConfigPomodoro) => void;
  agregarConfiguracion: (config: ConfigPomodoro) => void;
  eliminarConfiguracion: (id: string) => void;
  editarConfiguracion: (configModificada: ConfigPomodoro) => void;
  estaActivo: boolean;
  setEstaActivo: (activo: boolean) => void;
  sesionEnCurso: boolean;
  setSesionEnCurso: (enCurso: boolean) => void;

  historial: RegistroPomodoro[];
  guardarRegistro: (datos: Omit<RegistroPomodoro, "id" | "fecha">) => void;
  eliminarRegistro: (id: string) => void;
  editarRegistro: (id: string, nuevosMinutos: number) => void;

  pantallaActual: "reloj" | "estadisticas" | "configuracion" | "historial";
  setPantallaActual: (pantalla: "reloj" | "estadisticas" | "configuracion" | "historial") => void;

  sonidoHabilitado: boolean;
  notificacionesHabilitadas: boolean;
  toggleSonido: () => void;
  toggleNotificaciones: () => void;
  theme: "dia" | "noche";
  toggleTheme: () => void;
  setIdioma: (idioma: "es" | "en") => void;
  idioma: "en" | "es";

  modo: "trabajo" | "descanso_corto" | "descanso_largo";
  setModo: (modo: "trabajo" | "descanso_corto" | "descanso_largo") => void;
}

// Datos de demostración (solo si VITE_DEMO_MODE === "true")
const DEMO_PRESETS: ConfigPomodoro[] = [
  {
    id: "demo1",
    nombre: "25/5 Estudio",
    tiempo_trabajo: 25,
    tiempo_corto_descanso: 5,
    tiempo_largo_descanso: 15,
    ciclos_hasta_descanso_largo: 4,
  },
  {
    id: "demo2",
    nombre: "50/10 Trabajo",
    tiempo_trabajo: 50,
    tiempo_corto_descanso: 10,
    tiempo_largo_descanso: 30,
    ciclos_hasta_descanso_largo: 3,
  },
  {
    id: "demo3",
    nombre: "15/3 Rápido",
    tiempo_trabajo: 15,
    tiempo_corto_descanso: 3,
    tiempo_largo_descanso: 10,
    ciclos_hasta_descanso_largo: 4,
  },
];

const DEMO_HISTORIAL = [
  {
    id: "hist1",
    fecha: new Date().toISOString().split("T")[0],
    minutos: 25,
    minutosDescanso: 5,
    completado: true,
    nombreModo: "25/5 Estudio",
  },
  {
    id: "hist2",
    fecha: new Date().toISOString().split("T")[0],
    minutos: 25,
    minutosDescanso: 5,
    completado: true,
    nombreModo: "25/5 Estudio",
  },
  {
    id: "hist3",
    fecha: new Date(Date.now() - 86400000).toISOString().split("T")[0], // ayer
    minutos: 50,
    minutosDescanso: 10,
    completado: true,
    nombreModo: "50/10 Trabajo",
  },
  {
    id: "hist4",
    fecha: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    minutos: 15,
    minutosDescanso: 0,
    completado: false,
    nombreModo: "15/3 Rápido",
  },
];

console.log("VITE_DEMO_MODE:", import.meta.env.VITE_DEMO_MODE);
const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
console.log("isDemoMode:", isDemoMode);

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      listaConfiguraciones: isDemoMode ? DEMO_PRESETS : [],
      configActiva: isDemoMode ? DEMO_PRESETS[0] : null,
      historial: isDemoMode ? DEMO_HISTORIAL : [],

      modo: "trabajo",
      setModo: (modo) => set({ modo }),

      sesionEnCurso: false,
      setSesionEnCurso: (enCurso) => set({ sesionEnCurso: enCurso }),

      estaActivo: false,
      setEstaActivo: (activo) => set({ estaActivo: activo }),

      guardarRegistro: (datos) => {
        const hoy = new Date().toISOString().split("T")[0];
        const nuevoRegistro: RegistroPomodoro = {
          id: Date.now().toString(),
          fecha: hoy,
          ...datos,
        };
        set((state) => ({ historial: [...state.historial, nuevoRegistro] }));
      },
      eliminarRegistro: (id) =>
        set((state) => ({
          historial: state.historial.filter((registro) => registro.id !== id),
        })),
      editarRegistro: (id, nuevosMinutos) =>
        set((state) => ({
          historial: state.historial.map((registro) =>
            registro.id === id ? { ...registro, minutos: nuevosMinutos } : registro,
          ),
        })),

      theme: "dia",
      toggleTheme: () =>
        set((state) => {
          const nuevoTema = state.theme === "dia" ? "noche" : "dia";
          document.documentElement.setAttribute("data-app-mode", nuevoTema);
          return { theme: nuevoTema };
        }),

      sonidoHabilitado: true,
      notificacionesHabilitadas: true,
      toggleSonido: () => set((state) => ({ sonidoHabilitado: !state.sonidoHabilitado })),
      toggleNotificaciones: () => set((state) => ({ notificacionesHabilitadas: !state.notificacionesHabilitadas })),
      pantallaActual: "reloj",
      setPantallaActual: (pantalla) => set({ pantallaActual: pantalla }),
      setConfigActiva: (config) => set({ configActiva: config }),

      agregarConfiguracion: (nuevaConfig) =>
        set((state) => ({
          listaConfiguraciones: [...state.listaConfiguraciones, nuevaConfig],
          configActiva: nuevaConfig,
        })),
      eliminarConfiguracion: (idABorrar) => {
        const state = get();
        const nuevaLista = state.listaConfiguraciones.filter((config) => config.id !== idABorrar);
        set({ listaConfiguraciones: nuevaLista });
        if (state.configActiva?.id === idABorrar) {
          set({ configActiva: nuevaLista[0] || null });
        }
      },
      editarConfiguracion: (configModificada) => {
        const state = get();
        const nuevaLista = state.listaConfiguraciones.map((config) =>
          config.id === configModificada.id ? configModificada : config,
        );
        set({ listaConfiguraciones: nuevaLista });
        if (state.configActiva?.id === configModificada.id) {
          set({ configActiva: configModificada });
        }
      },

      idioma: "en",
      setIdioma: (idioma) => set({ idioma }),
    }),
    {
      name: "pomodoro-config-storage",
      onRehydrateStorage: () => (state) => {
        if (state && isDemoMode) {
          if (state.listaConfiguraciones.length === 0) {
            state.listaConfiguraciones = DEMO_PRESETS;
            state.configActiva = DEMO_PRESETS[0];
            state.historial = DEMO_HISTORIAL;
          }
        }
      },
    },
  ),
);
