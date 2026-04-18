export interface ConfigPomodoro {
  id: string;
  nombre: string;
  tiempo_trabajo: number;
  tiempo_corto_descanso: number;
  tiempo_largo_descanso: number;
  ciclos_hasta_descanso_largo: number;
}
