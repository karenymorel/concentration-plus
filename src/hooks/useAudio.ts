import { useCallback } from "react";

export const useAudio = (rutaDelArchivo: string) => {
  const reproducirSonido = useCallback(() => {
    const audio = new Audio(rutaDelArchivo);
    audio.play().catch((error) => {
      console.error("Error al reproducir el audio. El navegador puede estar bloqueándolo:", error);
    });
  }, [rutaDelArchivo]);

  return reproducirSonido;
};
