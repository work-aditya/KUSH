// Ambient type definitions for Supabase Edge Functions in VS Code / TypeScript
// This resolves "Cannot find name 'Deno'" and URL imports in editors without the Deno extension.

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    has(key: string): boolean;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }

  export const env: Env;

  export interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export type ServeHandler = (
    req: Request,
    info?: {
      remoteAddr: {
        hostname: string;
        port: number;
        transport: "tcp" | "udp";
      };
    }
  ) => Response | Promise<Response>;

  export function serve(handler: ServeHandler): void;
  export function serve(options: ServeOptions, handler: ServeHandler): void;
}

// Allow URL imports (e.g., https://esm.sh/...) in TypeScript editor
declare module "https://*" {
  const content: any;
  export default content;
  export const createClient: any;
}
