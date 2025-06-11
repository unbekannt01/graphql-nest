
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export interface RegisterUserArgs {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
}

export interface UpdateUserArgs {
    firstName?: Nullable<string>;
    lastName?: Nullable<string>;
    email?: Nullable<string>;
    password?: Nullable<string>;
    id: number;
}

export interface AddBookArgs {
    id: number;
    title: string;
    price: number;
}

export interface UpdateBookArgs {
    title?: Nullable<string>;
    price?: Nullable<number>;
    id: number;
}

export interface Person {
    id: string;
    firstName: string;
    lastName: string;
}

export interface Book {
    info: JSON;
    id: number;
    title: string;
    price: number;
}

export interface User extends Person {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    books?: Nullable<Book[]>;
    files?: Nullable<UploadFile[]>;
}

export interface UploadFile {
    id: number;
    filename: string;
    url: string;
    userId: number;
}

export interface LoginResult {
    message: string;
    access_token: string;
    refresh_token: string;
}

export interface IQuery {
    index(): string | Promise<string>;
    securedDataforUser(): string | Promise<string>;
    securedDataforAdmin(): string | Promise<string>;
    login(email: string, password: string): LoginResult | Promise<LoginResult>;
    users(): User[] | Promise<User[]>;
    books(): Book[] | Promise<Book[]>;
    pagination(page: number, limit: number): Book[] | Promise<Book[]>;
    myBooks(): Book[] | Promise<Book[]>;
    bookById(bookId: number): Book | Promise<Book>;
    myFiles(): UploadFile[] | Promise<UploadFile[]>;
}

export interface IMutation {
    registerUser(registerUserArgs: RegisterUserArgs): string | Promise<string>;
    updateUser(updateUserArgs: UpdateUserArgs): User | Promise<User>;
    deleteUser(userId: number): string | Promise<string>;
    deleteBook(bookId: number): string | Promise<string>;
    addBook(addBookArgs: AddBookArgs): string | Promise<string>;
    updateBook(updateBookArgs: UpdateBookArgs): Book | Promise<Book>;
    singleUpload(file: Upload): string | Promise<string>;
    deleteFile(fileId: number): string | Promise<string>;
    updateFile(id: number, file: Upload): string | Promise<string>;
}

export interface ISubscription {
    bookAdded(): Book | Promise<Book>;
}

export type JSON = any;
export type Upload = any;
type Nullable<T> = T | null;
