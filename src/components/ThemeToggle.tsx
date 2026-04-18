import { useConfigStore } from "../store/useConfigStore";

export default function ThemeToggle() {
  const theme = useConfigStore((state) => state.theme);
  const toggleTheme = useConfigStore((state) => state.toggleTheme);

  return (
    <label
      className="swap swap-rotate w-12 h-12 rounded-2xl flex items-center justify-center bg-custom-sidebar border border-white/5 shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 group"
      title={theme === "noche" ? "Cambiar a modo día" : "Cambiar a modo noche"}
    >
      {/* Input oculto que controla el estado */}
      <input type="checkbox" className="hidden" onChange={toggleTheme} checked={theme === "noche"} />

      {/* ICONO SOL (Aparece cuando NO es noche) */}
      <svg
        className={`w-6 h-6 transition-all duration-500 ${theme === "noche" ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100 text-black-500"}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12,7a5,5,0,1,0,5,5A5,5,0,0,0,12,7Zm0,8a3,3,0,1,1,3-3A3,3,0,0,1,12,15Zm0-13a1,1,0,0,0-1,1V4a1,1,0,0,0,2,0V3A1,1,0,0,0,12,2Zm0,18a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V21A1,1,0,0,0,12,20ZM2,12a1,1,0,0,0,1,1H4a1,1,0,0,0,0-2H3A1,1,0,0,0,2,12Zm18,0a1,1,0,0,0,1,1h1a1,1,0,0,0,0-2H21A1,1,0,0,0,20,12ZM5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM18.36,5.64a1,1,0,0,0-1.41,0l-.71.71a1,1,0,0,0,1.41,1.41l.71-.71A1,1,0,0,0,18.36,5.64ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,4.93l.71.71A1,1,0,0,0,5.64,7.05Zm12.72,9.9a1,1,0,0,0-1.41,0l-.71.71a1,1,0,0,0,1.41,1.41l.71-.71A1,1,0,0,0,18.36,16.95Z" />
      </svg>

      {/* ICONO LUNA (Aparece cuando ES noche) */}
      <svg
        className={`absolute w-6 h-6 transition-all duration-500 ${theme === "noche" ? "opacity-100 rotate-0 scale-100 text-white-300" : "opacity-0 -rotate-90 scale-0"}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
      </svg>
    </label>
  );
}
