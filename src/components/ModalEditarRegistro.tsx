import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface ModalEditarRegistroProps {
  estaAbierto: boolean;
  cerrarModal: () => void;
  alGuardar: (minutos: number) => void;
  valorInicial: number;
}

export default function ModalEditarRegistro({
  estaAbierto,
  cerrarModal,
  alGuardar,
  valorInicial,
}: ModalEditarRegistroProps) {
  const { t } = useTranslation();
  const [minutos, setMinutos] = useState(valorInicial);

  useEffect(() => {
    setMinutos(valorInicial);
  }, [valorInicial]);

  if (!estaAbierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center           
justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        className="bg-custom-sidebar border border-white/10 p-6 
rounded-3xl shadow-2xl w-full max-w-sm animate-fade-in"
      >
        <h3
          className="text-xl font-bold text-custom-text          
mb-4"
        >
          {t("historial.acciones.editar_prompt")}
        </h3>

        <div className="flex flex-col gap-4">
          <input
            type="number"
            value={minutos}
            onChange={(e) => setMinutos(Number(e.target.value))}
            className="bg-custom-bg text-custom-text p-3 rounded-xl
border border-white/10 outline-none focus:border-[#72c1d9]         
transition-colors"
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={cerrarModal}
            className="px-4 py-2 text-custom-text/50               
hover:text-custom-text transition-colors"
          >
            {t("general.cancelar") || "Cancelar"}
          </button>
          <button
            onClick={() => alGuardar(minutos)}
            className="px-4 py-2 bg-[#72c1d9] text-custom-bg       
font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            {t("general.guardar") || "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
