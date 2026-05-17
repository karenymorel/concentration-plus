import { useTranslation } from "react-i18next";

interface ModalEliminarProps {
  estaAbierto: boolean;
  alCancelar: () => void;
  alAceptar: () => void;
  nombreConfigAEliminar?: string;
}

export default function ModalEliminar({
  estaAbierto,
  alCancelar,
  alAceptar,
  nombreConfigAEliminar,
}: ModalEliminarProps) {
  if (!estaAbierto) return null;

  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex justify-center items-center animate-fade-in p-4">
      <div className="bg-custom-sidebar rounded-3xl p-8 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative text-center transition-colors duration-300">
        {/* Icono de advertencia con brillo suave */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-500/10 mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* TEXTOS */}
        <h3 className="font-bold text-2xl mb-2 text-custom-text">{t("modals.eliminar.titulo")}</h3>
        <p className="text-custom-text/60 mb-8 leading-relaxed">
          {t("modals.eliminar.desc")} <br />
          <span className="font-bold text-red-500">"{nombreConfigAEliminar}"</span>.<br />
          <span className="text-sm opacity-50 italic">{t("modals.eliminar.desc_undo")}</span>
        </p>

        {/* ACCIONES */}
        <div className="flex justify-center gap-3">
          <button
            onClick={alCancelar}
            className="px-6 py-3 rounded-xl font-bold text-custom-text/50 hover:bg-white/5 hover:text-custom-text transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={alAceptar}
            className="px-8 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
          >
            {t("modals.eliminar.btn_confirmar")}
          </button>
        </div>
      </div>
    </div>
  );
}
