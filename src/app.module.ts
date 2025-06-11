/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import GraphQLJSON from 'graphql-type-json';
import { upperDirectiveTransformer } from './auth/directives/upperDirectiveTransformer.directive';
import { DirectiveLocation, GraphQLDirective } from 'graphql';
// import { loggerMiddleware } from './auth/logger-field.// import { MercuriusDriver } from '@nestjs/mercurius';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ComplexityPlugin } from './auth/plugins/complexity.plugin';
import { LoggingPlugin } from './auth/plugins/login.plugin';
import { UploadModule } from './upload/upload.module';

const upperDirective = new GraphQLDirective({
  name: 'upper',
  locations: [DirectiveLocation.FIELD_DEFINITION],
});
@Module({
  imports: [
    UserModule,
    AuthModule,
    BookModule,
    UploadModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      transformSchema: (schema) => upperDirectiveTransformer(schema, 'upper'),
      buildSchemaOptions: {
        directives: [upperDirective],
        // fieldMiddleware: [loggerMiddleware],
      },
      resolvers: { JSON: GraphQLJSON },
      driver: ApolloDriver,
      playground: true,
      installSubscriptionHandlers: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
      definitions: { path: join(process.cwd(), 'src/graphql.ts') },
      context: ({ req, res }) => ({ req, res }),
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      // typePaths: ['./**/*.graphql'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'buddy',
      database: 'graphql',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [AppResolver, ComplexityPlugin, LoggingPlugin],
})
export class AppModule {}
