import { forwardRef, Module } from '@nestjs/common';
import { BookService } from './book.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from './entities/book.entity';
import { BookResolver } from './book.resolver';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([BookEntity]),
  ],
  controllers: [],
  providers: [BookService, BookResolver],
  exports: [BookService, BookResolver],
})
export class BookModule {}
