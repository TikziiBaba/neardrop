// Type declarations for Deno runtime used in Supabase Edge Functions
// This file provides minimal type stubs so the IDE can resolve Deno-specific APIs.

declare namespace Deno {
  interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    has(key: string): boolean;
    toObject(): Record<string, string>;
  }

  const env: Env;
}

// Shim for https://deno.land/std HTTP serve
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

// Shim for Supabase client
declare module "https://esm.sh/@supabase/supabase-js@2" {
  export { createClient, SupabaseClient } from "@supabase/supabase-js";
}

// Shim for AWS SDK S3 client
declare module "https://esm.sh/@aws-sdk/client-s3@3.370.0" {
  export class S3Client {
    constructor(config: {
      region: string;
      endpoint: string;
      credentials: {
        accessKeyId: string;
        secretAccessKey: string;
      };
    });
    send(command: any): Promise<any>;
  }

  export class PutObjectCommand {
    constructor(input: {
      Bucket: string;
      Key: string;
      ContentType?: string;
      ContentLength?: number;
    });
  }

  export class GetObjectCommand {
    constructor(input: {
      Bucket: string;
      Key: string;
      ResponseContentDisposition?: string;
    });
  }

  export class DeleteObjectCommand {
    constructor(input: {
      Bucket: string;
      Key: string;
    });
  }
}

// Shim for AWS SDK S3 presigner
declare module "https://esm.sh/@aws-sdk/s3-request-presigner@3.370.0" {
  export function getSignedUrl(
    client: any,
    command: any,
    options?: { expiresIn?: number }
  ): Promise<string>;
}
