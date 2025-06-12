// upload.scalar.ts
import { Scalar } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload-minimal';

@Scalar('Upload', () => GraphQLUpload)
export class UploadScalar {}
