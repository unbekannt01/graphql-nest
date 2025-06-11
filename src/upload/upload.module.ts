import { forwardRef, Module } from '@nestjs/common';
import { UploadFileResolver } from './upload.resolver';
import { UploadFileService } from './upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadFile } from './entities/upload.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadFile]),
    forwardRef(() => UserModule),
  ],
  providers: [UploadFileResolver, UploadFileService],
  exports: [TypeOrmModule, UploadFileService],
})
export class UploadModule {}
