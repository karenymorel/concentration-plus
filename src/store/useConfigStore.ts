import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ConfigPomodoro } from "../models/ConfigPomodoro";
import { RegistroPomodoro } from "../models/RegistroPomodoro";

interface ConfigState {
  listaConfiguraciones: ConfigPomodoro[];
  configActiva: ConfigPomodoro;
  setConfigActiva: (config: ConfigPomodoro) => void;
  agregarConfiguracion: (config: ConfigPomodoro) => void;
  eliminarConfiguracion: (id: string) => void;
  editarConfiguracion: (configModificada: ConfigPomodoro) => void;

  historial: RegistroPomodoro[];
  guardarRegistro: (datos: Omit<RegistroPomodoro, "id" | "fecha">) => void;
  eliminarRegistro: (id: string) => void;
  editarRegistro: (id: string, nuevosMinutos: number) => void;

  // NUEVO: "historial" añadido a los tipos permitidos
  pantallaActual: "reloj" | "estadisticas" | "calendario" | "configuracion" | "historial";
  setPantallaActual: (pantalla: "reloj" | "estadisticas" | "calendario" | "configuracion" | "historial") => void;

  googleAccessToken: string | null;
  setGoogleAccessToken: (token: string | null) => void;
  sonidoHabilitado: boolean;
  notificacionesHabilitadas: boolean;
  toggleSonido: () => void;
  toggleNotificaciones: () => void;
  theme: "dia" | "noche";
  toggleTheme: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      listaConfiguraciones: [
        {
          id: "1",
          nombre: "25/5 Estudio",
          tiempo_trabajo: 25,
          tiempo_corto_descanso: 5,
          tiempo_largo_descanso: 15,
          ciclos_hasta_descanso_largo: 4,
        },
        {
          id: "2",
          nombre: "50/10 Deep Work",
          tiempo_trabajo: 50,
          tiempo_corto_descanso: 10,
          tiempo_largo_descanso: 30,
          ciclos_hasta_descanso_largo: 3,
        },
        {
          id: "3",
          nombre: "15/3 Rápido",
          tiempo_trabajo: 15,
          tiempo_corto_descanso: 3,
          tiempo_largo_descanso: 10,
          ciclos_hasta_descanso_largo: 4,
        },
      ],
      configActiva: {
        id: "1",
        nombre: "25/5 Estudio",
        tiempo_trabajo: 25,
        tiempo_corto_descanso: 5,
        tiempo_largo_descanso: 15,
        ciclos_hasta_descanso_largo: 4,
      },

      historial: [],

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
      googleAccessToken: null,
      setGoogleAccessToken: (token) => set({ googleAccessToken: token }),

      agregarConfiguracion: (nuevaConfig) =>
        set((state) => ({
          listaConfiguraciones: [...state.listaConfiguraciones, nuevaConfig],
          configActiva: nuevaConfig,
        })),
      eliminarConfiguracion: (idABorrar) => {
        const state = get();
        const nuevaLista = state.listaConfiguraciones.filter((config) => config.id !== idABorrar);
        set({ listaConfiguraciones: nuevaLista });
        if (state.configActiva.id === idABorrar) {
          set({ configActiva: nuevaLista[0] });
        }
      },
      editarConfiguracion: (configModificada) => {
        const state = get();
        const nuevaLista = state.listaConfiguraciones.map((config) =>
          config.id === configModificada.id ? configModificada : config,
        );
        set({ listaConfiguraciones: nuevaLista });
        if (state.configActiva.id === configModificada.id) {
          set({ configActiva: configModificada });
        }
      },
    }),
    {
      name: "pomodoro-config-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute("data-app-mode", state.theme);
        }
      },
    },
  ),
);
