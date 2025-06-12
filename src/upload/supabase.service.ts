/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
// supabase.service.ts

import { Injectable } from '@nestjs/common';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SuperBaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

//   async uploadBuffer(
//     filename: string,
//     buffer: Buffer,
//     mimetype: string,
//   ): Promise<string> {
//     const filePath = `${Date.now()}-${filename}`;
//     const bucket = 'uploadspublic';

//     const { data, error } = await this.client.storage
//       .from(bucket)
//       .upload(filePath, buffer, {
//         contentType: mimetype,
//         upsert: true,
//       });

//     console.log(data);
//     console.log(error);

//     if (error) {
//       throw new Error(error.message);
//     }

//     const { data: publicUrlData } = this.client.storage
//       .from('uploadspublic')
//       .getPublicUrl(filePath);

//     console.log(publicUrlData);

//     return publicUrlData.publicUrl;
//   }

  async uploadBuffer(
    filename: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    const filePath = `${Date.now()}-${filename}`;
    const bucket = 'uploads';

    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(error.message);
    }

    // Generate a signed URL for private access
    const { data: signedUrlData, error: signedUrlError } =
      await this.client.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60); // 1 hour access

    if (signedUrlError) {
      console.error('Signed URL error:', signedUrlError);
      throw new Error(signedUrlError.message);
    }

    return signedUrlData.signedUrl;
  }

  async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
}
