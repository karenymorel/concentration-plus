import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import fs from "node:fs";

export default defineConfig(({ mode }) => {
  const electronMainExists = fs.existsSync(path.join(__dirname, "electron/main.ts"));

  return {
    plugins: [
      react(),
      ...(electronMainExists
        ? [
            electron({
              main: {
                entry: "electron/main.ts",
              },
              preload: {
                input: path.join(__dirname, "electron/preload.ts"),
              },
              renderer: process.env.NODE_ENV === "test" ? undefined : {},
            }),
          ]
        : []),
    ],
  };
});
