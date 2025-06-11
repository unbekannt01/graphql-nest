import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { BookModule } from '../book/book.module';
import { UserResolver } from './user.resolver';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => BookModule),
    UploadModule,
  ],
  controllers: [],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
