// src/global.d.ts or root/global.d.ts
export {};

declare global {
  interface Window {
    google: typeof google;
  }

  const google: {
    accounts: {
      id: {
        CredentialResponse: { credential: string };
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: { theme: string; size: string }
        ) => void;
        prompt: () => void;
      };
    };
  };
}
