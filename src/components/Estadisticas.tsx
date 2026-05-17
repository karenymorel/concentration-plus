import { useConfigStore } from "../store/useConfigStore";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function Estadisticas() {
  const { t } = useTranslation();
  const historial = useConfigStore((state) => state.historial);

  const minutosTotales = historial.reduce((total, recibo) => total + recibo.minutos, 0);
  const pomodorosTotales = historial.length;

  const agruparPorDia = historial.reduce(
    (acumulador, recibo) => {
      if (!acumulador[recibo.fecha]) {
        acumulador[recibo.fecha] = { fecha: recibo.fecha, minutos: 0, sesiones: 0, promedio: 0 };
      }
      acumulador[recibo.fecha].minutos += recibo.minutos;
      acumulador[recibo.fecha].sesiones += 1;
      acumulador[recibo.fecha].promedio = Math.round(
        acumulador[recibo.fecha].minutos / acumulador[recibo.fecha].sesiones,
      );
      return acumulador;
    },
    {} as Record<string, { fecha: string; minutos: number; sesiones: number; promedio: number }>,
  );

  const datosUltimosDias = Object.values(agruparPorDia).slice(-7);

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const datosPorDiaSemana = historial.reduce(
    (acc, recibo) => {
      const [year, month, day] = recibo.fecha.split("-");
      const fechaReal = new Date(Number(year), Number(month) - 1, Number(day));
      const indiceDia = (fechaReal.getDay() + 6) % 7;
      const nombreDia = diasSemana[indiceDia];

      const diaExistente = acc.find((d) => d.name === nombreDia);
      if (diaExistente) {
        diaExistente.value += recibo.minutos;
      } else {
        acc.push({ name: nombreDia, value: recibo.minutos });
      }
      return acc;
    },
    [] as { name: string; value: number }[],
  );

  const COLORES_TORTA = ["#EC4166", "#72c1d9", "#f06b88", "#338293", "#f494a9", "#66a1ae", "#f8bdca"];

  const tooltipStyle = {
    backgroundColor: "var(--bg-app)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "var(--text-app)",
  };

  return (
    <section className="flex flex-col items-center w-full min-h-full p-8 animate-fade-in bg-custom-bg transition-colors duration-300">
      <h2 className="text-4xl font-bold text-custom-text mb-8">{t("estadisticas.titulo")}</h2>

      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mb-10">
        <div className="bg-custom-sidebar p-8 rounded-3xl shadow-2xl border border-white/5 text-center flex flex-col items-center">
          <div className="text-custom-text/60 text-lg font-semibold">{t("estadisticas.sesiones_titulo")}</div>
          <div className="text-[#EC4166] text-6xl font-bold my-2 drop-shadow-[0_0_15px_rgba(236,65,102,0.3)]">
            {pomodorosTotales}
          </div>
          <div className="text-custom-text/30 text-sm italic">{t("estadisticas.sesiones_desc")}</div>
        </div>

        <div className="bg-custom-sidebar p-8 rounded-3xl shadow-2xl border border-white/5 text-center flex flex-col items-center">
          <div className="text-custom-text/60 text-lg font-semibold">{t("estadisticas.tiempo_titulo")}</div>
          <div className="text-[#72c1d9] text-6xl font-bold my-2 drop-shadow-[0_0_15px_rgba(114,193,217,0.3)]">
            {minutosTotales}m
          </div>
          <div className="text-custom-text/30 text-sm italic">{t("estadisticas.tiempo_desc")}</div>
        </div>
      </div>

      {/* GRILLA DE GRÁFICOS */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        {/* GRÁFICO 1: BARRAS (VOLUMEN) */}
        <div className="bg-custom-sidebar p-6 rounded-3xl shadow-xl border border-white/5">
          <h3 className="text-xl font-bold text-custom-text/80 mb-6 text-center">
            {t("estadisticas.grafico_minutos")}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosUltimosDias}>
                <XAxis dataKey="fecha" stroke="#a3a3a3" fontSize={10} tickMargin={10} />
                <YAxis stroke="#a3a3a3" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="minutos" fill="#EC4166" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 2: ÁREA (FRECUENCIA) */}
        <div className="bg-custom-sidebar p-6 rounded-3xl shadow-xl border border-white/5">
          <h3 className="text-xl font-bold text-custom-text/80 mb-6 text-center">
            {t("estadisticas.grafico_frecuencia")}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosUltimosDias}>
                <defs>
                  <linearGradient id="colorSesiones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#72c1d9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#72c1d9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="fecha" stroke="#a3a3a3" fontSize={10} tickMargin={10} />
                <YAxis stroke="#a3a3a3" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="sesiones" stroke="#72c1d9" strokeWidth={3} fill="url(#colorSesiones)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 3: DONUT (DISTRIBUCIÓN) */}
        <div className="bg-custom-sidebar p-6 rounded-3xl shadow-xl border border-white/5">
          <h3 className="text-xl font-bold text-custom-text/80 mb-2 text-center">Días más Activos</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosPorDiaSemana}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {datosPorDiaSemana.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES_TORTA[index % COLORES_TORTA.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 4: LÍNEA (PROMEDIO) */}
        <div className="bg-custom-sidebar p-6 rounded-3xl shadow-xl border border-white/5">
          <h3 className="text-xl font-bold text-custom-text/80 mb-6 text-center">
            {t("estadisticas.grafico_promedio")}
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosUltimosDias}>
                <XAxis dataKey="fecha" stroke="#a3a3a3" fontSize={10} tickMargin={10} />
                <YAxis stroke="#a3a3a3" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="promedio"
                  stroke="#EC4166"
                  strokeWidth={4}
                  dot={{ r: 4, fill: "#EC4166", strokeWidth: 2, stroke: "var(--bg-app)" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
