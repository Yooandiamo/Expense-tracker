/// <reference types="vite/client" />

// Fix: Augment NodeJS.ProcessEnv to correctly type process.env.API_KEY without conflicting with global process declaration
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
