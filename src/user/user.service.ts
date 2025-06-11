/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { RegisterUserArgs } from './args/register-user.args';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserArgs } from './args/update-user.args';
import { UploadFile } from 'src/upload/entities/upload.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    public readonly userRepo: Repository<User>,
    @InjectRepository(UploadFile)
    public readonly uploadRepo: Repository<UploadFile>,
    private readonly configService: ConfigService,
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
      const hashedPassword = await bcrypt.hash(registerUserArgs.password, 10);
      user = this.userRepo.create({
        ...registerUserArgs,
        password: hashedPassword,
        Creation: new Date(),
      });
    }

    await this.userRepo.save(user);
    return 'User registered successfully!';
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const token = await this.generateTokens(user);
    if (!token) {
      throw new HttpException(
        'Token generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      user,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    };
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

  // generate access token and refresh token
  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: '1d',
    });

    const refreshToken = uuid();
    user.refreshToken = refreshToken;
    await this.userRepo.save(user);

    return { accessToken, refreshToken };
  }

  // Verify the refresh token and generate a new access token
  async verifyRefreshToken(refreshToken: string): Promise<string> {
    const user = await this.userRepo.findOne({ where: { refreshToken } });
    if (!user) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }
    
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '1d' },
    );
    return newAccessToken;
  }
}
