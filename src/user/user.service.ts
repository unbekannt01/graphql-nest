/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterUserArgs } from './args/register-user.args';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserArgs } from './args/update-user.args';
import { UploadFile } from 'src/upload/entities/upload.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public readonly userRepo: Repository<User>,
    @InjectRepository(UploadFile)
    public readonly uploadRepo: Repository<UploadFile>,
  ) {}

  async registerUser(registerUserArgs: RegisterUserArgs) {
    // Check if user already exists
    const existingUser = await this.userRepo.findOne({
      where: { email: registerUserArgs.email },
    });

    let user: User;

    if (existingUser) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const hashesPassword = await bcrypt.hash(registerUserArgs.password, 10);
      user = this.userRepo.create({
        ...registerUserArgs,
        password: hashesPassword,
        Creation: new Date(),
      });
    }

    await this.userRepo.save(user);
    return 'User registered successfully!';
  }

  async findUserByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email: email } });
    return user;
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findAllUsersWithBooks(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['book'],
      // take: limit ?? 12,
    });
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findUserByIdWithBooks(id: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['book'],
    });
  }

  async findUserFiles(userId: number): Promise<UploadFile[]> {
    const user1 = await this.uploadRepo.find({
      where: { user: { id: userId } },
    });
    return user1;
  }

  async updateUser(updateUserArgs: UpdateUserArgs): Promise<User | null> {
    const { id, ...updateData } = updateUserArgs;
    const user = new User();
    user.Updation = new Date();
    await this.userRepo.update(
      { id },
      { ...updateData, Updation: user.Updation },
    );
    return this.userRepo.findOne({ where: { id } });
  }

  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id: id } });
    if (!user) {
      throw new HttpException('User Not Found...!', HttpStatus.NOT_FOUND);
    }
    await this.userRepo.delete(id);
    return 'User Deleted Successfully...!';
  }
}
