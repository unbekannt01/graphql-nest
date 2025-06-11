import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BookEntity } from './entities/book.entity';
import { UserService } from 'src/user/user.service';
import { AddBookArgs } from './args/add-book.args';
import { UpdateBookArgs } from './args/update-book.args';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationArgs } from './args/pagination.args';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(BookEntity)
    public readonly bookRepo: Repository<BookEntity>,
    private readonly userService: UserService,
  ) {}

  async addBook(addBookArgs: AddBookArgs, userId: number): Promise<BookEntity> {
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const book: BookEntity = new BookEntity();
    book.title = addBookArgs.title;
    book.price = addBookArgs.price;
    book.user = user;
    book.Creation = new Date();

    const savedBook = await this.bookRepo.save(book);

    const fullBook = await this.bookRepo.findOne({
      where: { id: savedBook.id },
      relations: ['user'],
    });

    if (!fullBook) {
      throw new Error('Book creation failed: could not retrieve saved book');
    }

    return fullBook;
  }

  async updateBook(
    updateBookArgs: UpdateBookArgs,
    userId: number,
  ): Promise<BookEntity | null> {
    const book = await this.bookRepo.findOne({
      where: { id: updateBookArgs.id, user: { id: userId } },
      relations: ['user'],
    });

    if (!book) {
      throw new HttpException(
        'Book not found or you do not have permission to update it',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.bookRepo.update(
      { id: updateBookArgs.id, user: { id: userId } },
      {
        ...updateBookArgs,
        Updation: new Date(),
      },
    );
    return await this.bookRepo.findOne({ where: { id: updateBookArgs.id } });
  }

  async findAllBooks(): Promise<BookEntity[]> {
    const books = await this.bookRepo.find({ relations: ['user'] });
    return books;
  }

  async findUserBooks(userId: number): Promise<BookEntity[]> {
    const books = await this.bookRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    return books;
  }

  async findBookById(id: number, userId?: number): Promise<BookEntity | null> {
    const whereCondition = userId
      ? { id: id, user: { id: userId } }
      : { id: id };

    const book = await this.bookRepo.findOne({
      where: whereCondition,
      relations: ['user'],
    });
    return book;
  }

  async deleteBook(id: number, userId: number) {
    const book = await this.bookRepo.findOne({
      where: { id: id, user: { id: userId } },
    });

    if (!book) {
      throw new HttpException(
        'Book not found or you do not have permission to delete it',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.bookRepo.delete(id);
    return 'Book has been Deleted..!';
  }

  async findAll(pagination: PaginationArgs): Promise<BookEntity[]> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    return this.bookRepo.find({
      skip,
      take: limit,
      order: { id: 'DESC' },
    });
  }
}
