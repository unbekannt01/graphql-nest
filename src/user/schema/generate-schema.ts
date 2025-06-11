/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { printSchema } from 'graphql';
import { AppResolver } from '../../app.resolver';

async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([AppResolver]); // add other resolvers as needed

  console.log(printSchema(schema));

  await app.close(); // Don't forget to close the app
}

generateSchema();
