/* eslint-disable @typescript-eslint/no-unused-vars */
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
      await this.client.storage.from(bucket).createSignedUrl(filePath, 60 * 60); // 1 hour access

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

  async deleteFile(fileUrlOrPath: string): Promise<void> {
    const bucket = 'uploads';

    let filePath: string;

    if (fileUrlOrPath.includes('supabase.co')) {
      // Extract the path inside the bucket
      const parts = fileUrlOrPath.split(`${bucket}/`);
      if (parts.length < 2) {
        throw new Error('Invalid Supabase file URL');
      }

      // Remove query params from signed URL
      filePath = parts[1].split('?')[0];
    } else {
      filePath = fileUrlOrPath;
    }

    console.log('Deleting from Supabase bucket:', bucket);
    console.log('File path to delete:', filePath);

    const { error } = await this.client.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(error.message);
    }

    console.log('Successfully deleted from Supabase.');
  }
}
