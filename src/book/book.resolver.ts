/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Args,
  Context,
  Int,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Book } from './schema/book.schema';
import { BookService } from './book.service';
import { AddBookArgs } from './args/add-book.args';
import { UpdateBookArgs } from './args/update-book.args';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { BookEntity } from './entities/book.entity';
import { PaginationArgs } from './args/pagination.args';
import { PubSub } from 'graphql-subscriptions';

// Create a typed PubSub instance
const pubSub = new PubSub();

@Resolver(() => Book)
export class BookResolver {
  constructor(private readonly bookService: BookService) {}

  @Query(() => [Book], { name: 'books' })
  getAllBooks() {
    return this.bookService.findAllBooks();
  }

  @Query(() => [Book], { name: 'pagination' })
  async getBooks(@Args() pagination: PaginationArgs): Promise<BookEntity[]> {
    return this.bookService.findAll(pagination);
  }

  @Query(() => [Book], { name: 'myBooks' })
  @UseGuards(JwtGuard)
  getMyBooks(@Context() context: any) {
    const user = context.user || context.req.user;
    return this.bookService.findUserBooks(user.id);
  }

  @Query(() => Book, { name: 'bookById' })
  @UseGuards(JwtGuard)
  getBookById(
    @Args({ name: 'bookId', type: () => Int }) id: number,
    @Context() context: any,
  ) {
    const user = context.user || context.req.user;
    return this.bookService.findBookById(id, user.id);
  }

  @Mutation(() => String, { name: 'deleteBook' })
  @UseGuards(JwtGuard)
  deleteBookById(
    @Args({ name: 'bookId', type: () => Int }) id: number,
    @Context() context: any,
  ) {
    const user = context.user || context.req.user;
    return this.bookService.deleteBook(id, user.id);
  }

  @Mutation(() => String, { name: 'addBook' })
  @UseGuards(JwtGuard)
  async addBook(
    @Args('addBookArgs') addBookArgs: AddBookArgs,
    @Context() context: any,
  ) {
    const user = context.user || context.req.user;
    const newBook = await this.bookService.addBook(addBookArgs, user.id);

    if (!newBook?.id) {
      throw new Error('Failed to create book with valid ID');
    }

    await pubSub.publish('bookAdded', { bookAdded: newBook });
    return 'Book added successfully';
  }

  @Subscription(() => Book, { name: 'bookAdded' })
  bookAdded() {
    // Use correct asyncIterator method (lowercase i)
    return pubSub.asyncIterableIterator('bookAdded');
  }

  @Mutation(() => Book, { name: 'updateBook' })
  @UseGuards(JwtGuard)
  updateBook(
    @Args('updateBookArgs') updateBookArgs: UpdateBookArgs,
    @Context() context: any,
  ) {
    const user = context.user || context.req.user;
    return this.bookService.updateBook(updateBookArgs, user.id);
  }
}
