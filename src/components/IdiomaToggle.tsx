import { useTranslation } from "react-i18next";
import { useConfigStore } from "../store/useConfigStore";

export default function IdiomaToggle() {
  const { t, i18n } = useTranslation();

  const idioma = useConfigStore((state) => state.idioma);
  const setIdioma = useConfigStore((state) => state.setIdioma);
  const modo = useConfigStore((state) => state.modo);
  const colorAcento = modo === "trabajo" ? "#EC4166" : modo === "descanso_corto" ? "#72c1d9" : "#6a81f2";

  const handleLanguageChange = (newLang: "es" | "en") => {
    setIdioma(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex items-center space-x-2 p-2 rounded-2xl bg-custom-sidebar border border-white/5">
      <button
        onClick={() => handleLanguageChange("es")}
        style={{
          backgroundColor: idioma === "es" ? colorAcento : "",
        }}
        className={`px-3 py-1 rounded-lg transition-all duration-200 ${
          idioma === "es"
            ? "text-white font-bold shadow-md"
            : "text-custom-text/70 hover:bg-custom-bg          hover:text-custom-text"
        }`}
        title={t("general.change_to_spanish")}
      >
        ES
      </button>

      <button
        onClick={() => handleLanguageChange("en")}
        style={{
          backgroundColor: idioma === "en" ? colorAcento : "",
        }}
        className={`px-3 py-1 rounded-lg transition-all        
duration-200 ${
          idioma === "en"
            ? "text-white font-bold shadow-md"
            : "text-custom-text/70 hover:bg-custom-bg          hover:text-custom-text"
        }`}
        title={t("general.change_to_english")}
      >
        EN
      </button>
    </div>
  );
}
