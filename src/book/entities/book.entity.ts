/* eslint-disable prettier/prettier */
import { Directive, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'book' })
export class BookEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Directive('@upper')
  @Column()
  title: string;

  @Column()
  price: number;

  @Column({ type: 'timestamp', nullable: true })
  Creation: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  Updation: Date | null;

  @ManyToOne(() => User, (user) => user.book, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;
}
