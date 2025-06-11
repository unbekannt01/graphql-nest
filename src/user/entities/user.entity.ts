/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ObjectType } from '@nestjs/graphql';
import { Roles } from 'src/auth/guards/role.guard';
import { BookEntity } from 'src/book/entities/book.entity';
import { UploadFile } from 'src/upload/entities/upload.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('user1')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: Roles.USER })
  role: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  Creation: Date;

  @Column({ type: 'timestamp', nullable: true })
  Updation: Date;

  @OneToMany(() => BookEntity, (book) => book.user, { onDelete: 'CASCADE' })
  book: BookEntity[];

  @OneToMany(() => UploadFile, (file) => file.user, { onDelete: 'CASCADE' })
  file: UploadFile[];
}
