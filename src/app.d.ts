// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user: { id: string; email: string; name?: string } | null;
    }
  }
}
export {};


export {};
