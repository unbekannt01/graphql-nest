/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { User } from './schema/user.schema';
import { UserService } from './user.service';
import { RegisterUserArgs } from './args/register-user.args';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Book } from 'src/book/schema/book.schema';
import { BookService } from 'src/book/book.service';
import { UpdateUserArgs } from './args/update-user.args';
import { RoleGuard, Roles } from 'src/auth/guards/role.guard';
import { UploadFileService } from 'src/upload/upload.service';
import { UploadFile } from 'src/upload/schema/upload.schema';
import { LoginResult } from './loginResult';
import * as jwt from 'jsonwebtoken';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly uploadService: UploadFileService,
  ) {}

  @Mutation(() => String, { name: 'registerUser' })
  registerUser(@Args('registerUserArgs') registerUserArgs: RegisterUserArgs) {
    return this.userService.registerUser(registerUserArgs);
  }

  @Query(() => LoginResult)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: { req: any; res: { cookie: (...args: any[]) => void } }, // this contains both req and res
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

  @Mutation(() => User, { name: 'updateUser' })
  @UseGuards(JwtGuard)
  updateUser(@Args('updateUserArgs') updateUserArgs: UpdateUserArgs) {
    return this.userService.updateUser(updateUserArgs);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(JwtGuard, new RoleGuard(Roles.ADMIN))
  getAllUsers() {
    return this.userService.findAllUsersWithBooks();
  }

  @Mutation(() => String, { name: 'deleteUser' })
  @UseGuards(JwtGuard, new RoleGuard(Roles.ADMIN))
  deleteUserById(@Args({ name: 'userId', type: () => Int }) id: number) {
    return this.userService.deleteUser(id);
  }

  @ResolveField(() => [Book], { nullable: true })
  async books(@Parent() user: User): Promise<Book[]> {
    const bookEntities = await this.bookService.findUserBooks(user.id);
    return bookEntities.map((entity: any) => ({
      id: entity.id,
      title: entity.title,
      price: entity.price,
      info: entity.info ?? {},
    })) as Book[];
  }

  @ResolveField(() => [UploadFile], { nullable: true })
  async files(@Parent() user: User): Promise<UploadFile[]> {
    const uploadEntities = await this.uploadService.findUserFile(user.id);
    if (!Array.isArray(uploadEntities)) {
      return [];
    }
    // Map entity fields to schema fields
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
