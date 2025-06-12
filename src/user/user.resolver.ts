/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import {
  Query,
  Resolver,
  ResolveField,
  Parent,
  Mutation,
  Args,
  Int,
  Context,
} from '@nestjs/graphql';
import { User as UserSchema } from './schema/user.schema';
import { User as UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { RegisterUserArgs } from './args/register-user.args';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Book } from 'src/book/schema/book.schema';
import { BookService } from 'src/book/book.service';
import { UpdateUserArgs } from './args/update-user.args';
import { RoleGuard, Roles } from 'src/auth/guards/role.guard';
import { UploadFileService } from 'src/upload/upload.service';
import { UploadFile } from 'src/upload/schema/upload.schema';
import { LoginResult } from './loginResult';
import * as jwt from 'jsonwebtoken';

@Resolver(() => UserSchema)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly uploadService: UploadFileService,
  ) {}

  @Mutation(() => String, { name: 'registerUser' })
  async registerUser(registerUserArgs: RegisterUserArgs): Promise<string> {
    return this.userService.registerUser(registerUserArgs);
  }

  @Query(() => LoginResult)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: { req: any; res: { cookie: (...args: any[]) => void } },
  ): Promise<LoginResult> {
    const user = await this.userService.loginUser(email, password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    jwt.verify(user.accessToken, process.env.JWT_SECRET!);

    context.res.cookie('access_token', user.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Login Successfully...!',
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    };
  }

  @Query(() => String)
  async logout(
    @Args({ name: 'userId', type: () => Int }) id: number,
  ): Promise<string> {
    return this.userService.logout(id);
  }

  @Mutation(() => UserSchema, { name: 'updateUser' })
  @UseGuards(JwtGuard)
  async updateUser(
    @Args('updateUserArgs') updateUserArgs: UpdateUserArgs,
  ): Promise<UserEntity | null> {
    return this.userService.updateUser(updateUserArgs);
  }

  @Query(() => [UserSchema], { name: 'users' })
  @UseGuards(JwtGuard, new RoleGuard(Roles.ADMIN))
  async getAllUsers(): Promise<UserEntity[]> {
    return this.userService.findAllUsersWithBooks();
  }

  @Query(() => [UserSchema], { name: 'onlyUsers' })
  async getAllUsersWithOnlyUsers(): Promise<UserEntity[]> {
    return this.userService.findAllUsersWithoutAdmin();
  }

  @Mutation(() => UserSchema, { name: 'addFriend' })
  @UseGuards(JwtGuard)
  async addFriend(
    @Args('friendId', { type: () => Int }) friendId: number,
    @Context() context: any,
  ): Promise<UserEntity> {
    const user = context.user || context.req?.user;
    if (!user || !user.id) {
      throw new HttpException(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.userService.addFriend(Number(user.id), friendId);
  }

  @Mutation(() => UserSchema, { name: 'removeFriend' })
  @UseGuards(JwtGuard)
  async removeFriend(
    @Args('friendId', { type: () => Int }) friendId: number,
    @Context() context: any,
  ): Promise<UserEntity> {
    const user = context.user || context.req?.user;
    if (!user || !user.id) {
      throw new HttpException(
        'User not authenticated',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.userService.removeFriend(Number(user.id), friendId);
  }

  @Mutation(() => String, { name: 'deleteUser' })
  @UseGuards(JwtGuard, new RoleGuard(Roles.ADMIN))
  async deleteUserById(
    @Args({ name: 'userId', type: () => Int }) id: number,
  ): Promise<string> {
    return this.userService.deleteUser(id);
  }

  @Mutation(() => String, { name: 'generateNewAccessToken' })
  async generateNewAccessToken(
    @Args({ name: 'refreshToken', type: () => String }) refreshToken: string,
  ): Promise<string> {
    return this.userService.generateNewAccessToken(refreshToken);
  }

  @ResolveField(() => [Book], { nullable: true })
  async books(@Parent() user: UserEntity): Promise<Book[]> {
    const bookEntities = await this.bookService.findUserBooks(user.id);
    return bookEntities.map((entity: any) => ({
      id: entity.id,
      title: entity.title,
      price: entity.price,
      info: entity.info ?? {},
    })) as Book[];
  }

  @ResolveField(() => [UploadFile], { nullable: true })
  async files(@Parent() user: UserEntity): Promise<UploadFile[]> {
    const uploadEntities = await this.uploadService.findUserFile(user.id);
    if (!Array.isArray(uploadEntities)) {
      return [];
    }
    return uploadEntities.map((file: any) => ({
      id: file.id,
      filename: file.file,
      mimetype: file.mimetype ?? '',
      encoding: file.encoding ?? '',
      url: `/uploads/${file.file}`,
      userId: file.user?.id ?? user.id,
    }));
  }
}
