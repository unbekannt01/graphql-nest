/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { MoreThanOrEqual, Repository } from 'typeorm';
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

  async addFriend(userId: number, friendId: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['friends'],
    });
    const friend = await this.userRepo.findOne({
      where: { id: friendId },
      relations: ['friends'],
    });

    if (!user || !friend) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Check if they are already friends
    const alreadyFriends = user.friends?.some((f) => f.id === friendId);

    if (!alreadyFriends) {
      // Add friend to user's friends list
      user.friends = [...(user.friends || []), friend];

      // Add user to friend's friends list (bidirectional)
      friend.friends = [...(friend.friends || []), user];

      // Save both users
      await this.userRepo.save([user, friend]);
    }

    return user;
  }

  async removeFriend(userId: number, friendId: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['friends'],
    });
    const friend = await this.userRepo.findOne({
      where: { id: friendId },
      relations: ['friends'],
    });
    if (!user || !friend) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // Check if they are friends
    const isFriend = user.friends?.some((f) => f.id === friendId);
    if (isFriend) {
      // Remove friend from user's friends list
      user.friends = (user.friends ?? []).filter((f) => f.id !== friendId);

      // Remove user from friend's friends list (bidirectional)
      friend.friends = (friend.friends ?? []).filter((f) => f.id !== userId);

      // Save both users
      await this.userRepo.save([user, friend]);
    } else {
      throw new HttpException('Not friends', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  async logout(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User Not Found...!', HttpStatus.NOT_FOUND);
    }

    if (user.refreshToken === null) {
      throw new HttpException(
        'User Already Logout...!',
        HttpStatus.BAD_REQUEST,
      );
    }

    user.refreshToken = null;
    user.expiresInRefreshToken = null;

    await this.userRepo.save(user);
    return 'User Logout Successfully...!';
  }

  async findAllUsersWithoutAdmin(): Promise<User[]> {
    return this.userRepo.find({
      where: { role: 'USER' },
      select: ['id', 'firstName', 'email'],
    });
  }

  async findAllUsersWithBooks(): Promise<User[]> {
    return this.userRepo.find({
      relations: ['book', 'friends', 'file'],
    });
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
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 2);
    user.refreshToken = refreshToken;
    user.expiresInRefreshToken = expiryDate;
    await this.userRepo.save(user);

    return { accessToken, refreshToken };
  }

  async generateNewAccessToken(refreshToken: string): Promise<string> {
    const token = await this.userRepo.findOne({
      where: {
        refreshToken: refreshToken,
        expiresInRefreshToken: MoreThanOrEqual(new Date()),
      },
    });

    if (!token) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    const newAccessToken = jwt.sign(
      { id: token.id, email: token.email, role: token.role },
      jwtSecret,
      { expiresIn: '1d' },
    );

    const newRefreshToken = uuid();
    const newRefreshTokenExpiryDate = new Date();

    token.refreshToken = newRefreshToken;
    token.expiresInRefreshToken = newRefreshTokenExpiryDate;
    await this.userRepo.save(token);

    return newAccessToken;
  }
}
