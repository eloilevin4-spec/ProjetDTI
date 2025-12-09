// src/global.d.ts
export {}; // pour que ce fichier soit traité comme module

declare global {
  interface Window {
    electronAPI?: {
      sendNotification: (title: string, body: string) => void;
    };
  }
}
