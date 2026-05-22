import { useConfigStore } from "../store/useConfigStore";
import { FaTrash, FaPen, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { toast } from "sonner";
import { RegistroPomodoro } from "../models/RegistroPomodoro";
import { useTranslation } from "react-i18next";

export default function Historial() {
  const historial = useConfigStore((state) => state.historial);
  const eliminarRegistro = useConfigStore((state) => state.eliminarRegistro);
  const editarRegistro = useConfigStore((state) => state.editarRegistro);
  const { t, i18n } = useTranslation();

  const historialAgrupado = historial.reduce(
    (acumulador, registro) => {
      if (!acumulador[registro.fecha]) acumulador[registro.fecha] = [];
      acumulador[registro.fecha].push(registro);
      return acumulador;
    },
    {} as Record<string, RegistroPomodoro[]>,
  );

  const fechasOrdenadas = Object.keys(historialAgrupado).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatearFecha = (fechaISO: string) => {
    const [year, month, day] = fechaISO.split("-");
    const fecha = new Date(Number(year), Number(month) - 1, Number(day));
    return fecha.toLocaleDateString(i18n.language, { weekday: "long", day: "numeric", month: "long" }).toUpperCase();
  };

  return (
    <section className="flex flex-col items-center w-full h-full overflow-y-auto p-8 pb-24 animate-fade-in bg-custom-bg transition-colors duration-300">
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 shrink-0">
        <h2 className="text-4xl font-bold text-custom-text">{t("historial.titulo")}</h2>
        <div className="bg-custom-sidebar px-4 py-2 rounded-xl border border-white/5 shadow-md">
          <span className="text-[#EC4166] font-bold">{historial.length}</span>{" "}
          <span className="text-custom-text/60">{t("historial.registros_totales")}</span>
        </div>
      </div>

      {historial.length === 0 ? (
        <div className="bg-custom-sidebar p-10 rounded-3xl border border-white/5 shadow-xl text-center w-full max-w-5xl mt-10 shrink-0">
          <p className="text-custom-text/40 italic text-lg">{t("historial.sin_registros")}</p>
        </div>
      ) : (
        <div className="w-full max-w-5xl space-y-10">
          {fechasOrdenadas.map((fecha) => (
            <div
              key={fecha}
              className="bg-custom-sidebar rounded-3xl p-6 md:p-8 shadow-xl border border-white/5 shrink-0"
            >
              {/* TÍTULO DEL DÍA */}
              <h3 className="text-xl font-bold text-[#72c1d9] mb-6 border-b border-white/10 pb-2">
                📅 {formatearFecha(fecha)}
              </h3>

              <div className="overflow-x-auto">
                <table className="table w-full text-custom-text text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-custom-text uppercase text-xs">
                      <th className="font-semibold">{t("historial.tabla.modo")}</th>
                      <th className="font-semibold">{t("historial.tabla.estado")}</th>
                      <th className="font-semibold">{t("historial.tabla.estudio")}</th>
                      <th className="font-semibold">{t("historial.tabla.descanso")}</th>
                      <th className="font-semibold text-right">{t("historial.tabla.acciones")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* MOSTRAMOS LOS REGISTROS DEL DÍA ORDENADOS DEL ÚLTIMO AL PRIMERO */}
                    {historialAgrupado[fecha]
                      .slice()
                      .reverse()
                      .map((registro) => (
                        <tr key={registro.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="font-bold">{registro.nombreModo || "Personalizado"}</td>

                          <td>
                            {registro.completado ? (
                              <span className="flex items-center gap-2 text-green-500 text-sm font-medium">
                                <FaCheckCircle /> {t("historial.estado.completado")}
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-yellow-500 text-sm font-medium">
                                <FaTimesCircle /> {t("historial.estado.abortado")}
                              </span>
                            )}
                          </td>

                          <td className="text-[#EC4166] font-bold">{registro.minutos}m</td>

                          <td className="text-custom-text/60">{registro.minutosDescanso || 0}m</td>

                          <td className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                const nuevosMins = window.prompt(
                                  t("historial.acciones.editar_prompt"),
                                  registro.minutos.toString(),
                                );
                                if (nuevosMins && !isNaN(Number(nuevosMins))) {
                                  editarRegistro(registro.id, Number(nuevosMins));
                                  toast.success(t("historial.acciones.actualizado"));
                                }
                              }}
                              className="p-3 rounded-xl bg-custom-bg text-custom-text/50 hover:text-[#72c1d9] border border-white/5 transition-all"
                              title="Editar"
                            >
                              <FaPen size={14} />
                            </button>
                            <button
                              onClick={() => {
                                toast.error(t("historial.acciones.borrar_confirmar"), {
                                  description: t("historial.acciones.borrar_desc"),
                                  action: {
                                    label: t("historial.acciones.borrar_si"),
                                    onClick: () => {
                                      eliminarRegistro(registro.id);
                                      toast.success(t("historial.acciones.borrar_exito"));
                                    },
                                  },
                                  cancel: { label: "Cancelar", onClick: () => toast.dismiss() },
                                });
                              }}
                              className="p-3 rounded-xl bg-custom-bg text-custom-text/50 hover:text-red-400 border border-white/5 transition-all"
                              title="Eliminar"
                            >
                              <FaTrash size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
