import SEO from '../components/SEO';
import { Tabs, Tab } from 'oah-ui';
import MdxCard from '../components/MdxCard';

<SEO title="SDL first" />

<MdxCard>

## Introduction

This tool built on [Prisma](https://prisma.io) to auto generate graphql schema types and CRUD system from Prisma Client

> For any custom use in any framework you can open an issue with feature request to support generate for this framework by adding option to tool settings.

> NOTE: You must be familiar with `Prisma` and `graphql` before use this tool.

**CONTENT**

- [Features](#features)
- [Download starter project](#download-starter-project)
- [Install dependencies](#install-dependencies)
- [Example Usage](#example-usage)
  - [create context](#create-context)
  - [Add select function](#add-select-function)
- [Tool settings](#tool-settings)
  - [Type definition](#type-definition)
  - [Example](#example)

</MdxCard>

<MdxCard>

## Features

- Auto generate CRUD system from your `schema.prisma` file.
  - **Every model will have folder contain 2 files**
    - **_typeDefs.ts_** contain graphql types for this model
    - **_resolvers.ts_** contain 3 queries and 6 mutations:
      - `findOne`
      - `findMany`
      - `findCount`
      - `createOne`
      - `updateOne`
      - `upsertOne`
      - `deleteOne`
      - `updateMany`
      - `deleteMany`
  - Add to **_inputTypes.ts_** file list of inputs:
    - `UserWhereInput`
    - `UserWhereUniqueInput`
    - `UserOrderByInput`
    - `UserCreateInput`
    - `UserUpdateInput`
    - `UserUpdateManyMutationInput`
- Has function to convert `info: GraphQLResolveInfo` to select object accepted by `prisma client` this help in these points :-
  - Good solution for N + 1 issue.
  - Save performance with just query what frontend request from db
- Support any sdl first server
- Add onDelete cascade function to workaround missing function in Prisma migrate Cli more information [here](../delete)
- You have options to exclude anything you want.

  - exclude queries or mutations file for all models.
  - exclude queries or mutations from custom models.
  - exclude fields from all models.
  - exclude fields from custom model.
  - For more options [Tool settings](#tool-settings)

</MdxCard>

<MdxCard>

### Download starter project

This guide uses a small starter project that has Prisma configured against a SQLite database file.

Open your terminal and download the starter project with the following command:

<Tabs>
<Tab title="Unix (Mac OS, Linux)">

```shell
curl https://codeload.github.com/paljs/prisma-tools/tar.gz/master | tar -xz --strip=2 prisma-tools-master/examples/apollo-sdl-first
```

</Tab>
<Tab title="Windows">

```shell
curl https://codeload.github.com/paljs/prisma-tools/tar.gz/master -o master.tar.gz && tar -zxvf master.tar.gz prisma-tools-master/examples/apollo-sdl-first && move prisma-tools-master/examples/apollo-sdl-first apollo-sdl-first && rmdir /S /Q prisma-tools-master && del /Q master.tar.gz
```

</Tab>
</Tabs>

</MdxCard>

<MdxCard>

### Install dependencies

The project has downloaded to directory called apollo-sdl-first

<Tabs>
<Tab title="npm">

Run this three commands

```shell
cd apollo-sdl-first
npm i
npm run dev
```

</Tab>
<Tab title="yarn">

Run this three commands

```shell
cd apollo-sdl-first
yarn
yarn dev
```

</Tab>
</Tabs>

</MdxCard>

<MdxCard>

### Example Usage

For more information about Prisma look at they [Docs](https://www.prisma.io/docs)

`package.json`

```json
{
  "scripts": {
    "start": "node dist/server",
    "clean": "rm -rf dist",
    "build": "npm -s run clean && npm -s run generate && tsc",
    "generate": "npm -s run generate:prisma && npm -s run generate:crud",
    "generate:prisma": "prisma generate",
    "generate:crud": "ts-node --transpile-only src/createTypes",
    "seed": "ts-node --transpile-only prisma/seed",
    "create-migration": "prisma migrate save --experimental",
    "migrate-database": "prisma migrate up --experimental --auto-approve --create-db",
    "dev": "ts-node-dev --no-notify --respawn --transpileOnly src/server"
  }
}
```

`schema.prisma`

```prisma
datasource postgresql {
  url      = env("DATABASE_URL")
  provider = "postgresql"
}
generator client {
  provider = "prisma-client-js"
}
model User {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
}
model Post {
  id         Int        @id @default(autoincrement())
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  published  Boolean    @default(false)
  title      String
  author     User?      @relation(fields:  [authorId], references: [id])
  authorId   Int?
}
enum Role {
  USER
  ADMIN
}
```

After build your `schema.prisma` file all you need to run

```shell
yarn generate
```

This command will run two commands

```json
{
  "generate:prisma": "prisma generate",
  "generate:crud": "ts-node --transpile-only src/createTypes"
}
```

- build prisma client
- use our tool to auto generate your crud system

#### Output For User Model

<Tabs>
<Tab title="typeDefs.ts">

```ts
import gql from 'graphql-tag';

export default gql`
  type User {
    id: Int!
    email: String!
    name: String
    role: Role!
    createdAt: DateTime!
    posts(
      where: PostWhereInput
      orderBy: PostOrderByInput
      cursor: PostWhereUniqueInput
      take: Int
      skip: Int
    ): [Post!]!
  }

  type Query {
    findOneUser(where: UserWhereUniqueInput!): User
    findManyUser(
      where: UserWhereInput
      orderBy: UserOrderByInput
      cursor: UserWhereUniqueInput
      skip: Int
      take: Int
    ): [User!]
    findManyUserCount(
      where: UserWhereInput
      orderBy: UserOrderByInput
      cursor: UserWhereUniqueInput
      skip: Int
      take: Int
    ): Int!
  }
  type Mutation {
    createOneUser(data: UserCreateInput!): User!
    updateOneUser(where: UserWhereUniqueInput!, data: UserUpdateInput!): User!
    deleteOneUser(where: UserWhereUniqueInput!): User
    deleteManyUser(where: UserWhereInput): BatchPayload
    updateManyUser(where: UserWhereInput, data: UserUpdateManyMutationInput): BatchPayload
  }
`;
```

</Tab>
<Tab title="resolvers.ts">

```ts
import { Context } from '../../../context';

export default {
  Query: {
    findOneUser: (_parent, args, { prisma }: Context) => {
      return prisma.user.findOne(args);
    },
    findManyUser: (_parent, args, { prisma }: Context) => {
      return prisma.user.findMany(args);
    },
    findManyUserCount: (_parent, args, { prisma }: Context) => {
      return prisma.user.count(args);
    },
  },
  Mutation: {
    createOneUser: (_parent, args, { prisma }: Context) => {
      return prisma.user.create(args);
    },
    updateOneUser: (_parent, args, { prisma }: Context) => {
      return prisma.user.update(args);
    },
    deleteOneUser: async (_parent, args, { prisma, onDelete }: Context) => {
      await onDelete.cascade('User', args.where, false);
      return prisma.user.delete(args);
    },
    upsertOneUser: async (_parent, args, { prisma }: Context) => {
      return prisma.user.upsert(args);
    },
    deleteManyUser: async (_parent, args, { prisma, onDelete }: Context) => {
      await onDelete.cascade('User', args.where, false);
      return prisma.user.deleteMany(args);
    },
    updateManyUser: (_parent, args, { prisma }: Context) => {
      return prisma.user.updateMany(args);
    },
  },
};
```

</Tab>
</Tabs>

## create context

`context.ts`

```ts
import { PrismaClient, PrismaClientOptions } from '@prisma/client';
import PrismaDelete, { onDeleteArgs } from '@prisma-tools/delete';

class Prisma extends PrismaClient {
  constructor(options?: PrismaClientOptions) {
    super(options);
  }

  async onDelete(args: onDeleteArgs) {
    const prismaDelete = new PrismaDelete(this);
    await prismaDelete.onDelete(args);
  }
}

const prisma = new Prisma();

export interface Context {
  prisma: Prisma;
}

export function createContext(): Context {
  return {
    prisma,
  };
}
```

## Add select function

It's a small tool to convert `info: GraphQLResolveInfo` to select object accepted by `prisma client` this will give you the best performance because you will just query exactly what you want

This middleware is take `info` and convert it to Prisma select object and add to resolve args

`server.ts`

```ts
import { PrismaSelect } from '@prisma-tools/select';
import { ApolloServer } from 'apollo-server';
import { applyMiddleware } from 'graphql-middleware';
import { makeExecutableSchema } from 'graphql-tools';
import { createContext, Context } from './context';
import typeDefs from './graphql/models/typeDefs';
import resolvers from './graphql/models/resolvers';
import { GraphQLResolveInfo } from 'graphql';
import { generateGraphQlSDLFile } from '@prisma-tools/sdl';

let schema = makeExecutableSchema({ typeDefs, resolvers });

generateGraphQlSDLFile(schema);

const middleware = async (resolve, root, args, context: Context, info: GraphQLResolveInfo) => {
  const result = new PrismaSelect(info).value;
  if (Object.keys(result.select).length > 0) {
    args = {
      ...args,
      ...result,
    };
  }
  return resolve(root, args, context, info);
};

schema = applyMiddleware(schema, middleware);

const server = new ApolloServer({
  schema,
  context: createContext,
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

</MdxCard>

<MdxCard>

# Tool settings

You can optionally pass some settings to the plugin.

## Type definition

```ts
interface Options {
  // add onDelete.cascade() function on deleteOne and deleteMany mutations
  onDelete?: boolean;
  // rebuild only Input types
  onlyInputType?: boolean;
  // output path for models folders default 'src/graphql/models' you must create this folder
  modelsOutput?: string;
  // exclude fields from all models
  fieldsExclude?: string[];
  // exclude fields from one or more models will merge it with general fieldsExclude
  excludeFieldsByModel?: { [modelName: string]: string[] };
  // exclude queries or mutations for one or more models
  modelsExclude?: { name: string; queries?: boolean; mutations?: boolean }[];
  // disable all queries for all models
  disableQueries?: boolean;
  // disable all mutations for all models
  disableMutations?: boolean;
  // exclude queries and mutations for one or more model it's object with key : model name value array of QueriesAndMutations type
  excludeQueriesAndMutationsByModel?: {
    [modelName: string]: QueriesAndMutations[];
  };
  // exclude queries and mutations for all models array of QueriesAndMutations type
  excludeQueriesAndMutations?: QueriesAndMutations[];
}

type QueriesAndMutations =
  | 'findOne'
  | 'findMany'
  | 'findCount'
  | 'createOne'
  | 'updateOne'
  | 'upsertOne'
  | 'deleteOne'
  | 'updateMany'
  | 'deleteMany';
```

## Example

`src/createTypes.ts`

```ts
import { createTypes } from '@prisma-tools/sdl';

// for include every thing just createTypes() without any args

createTypes({
  // don't include 'createdAt', 'updatedAt' from any model
  fieldsExclude: ['createdAt', 'updatedAt'],
  // don't include 'password' field form 'User' model
  excludeFieldsByModel: {
    User: ['password'],
  },
  // don't include mutations file from 'Group' model
  modelsExclude: [{ name: 'Group', mutations: true }],
  // don't include 'deleteMany' mutation in 'Post' model mutations file
  excludeQueriesAndMutationsByModel: {
    Post: ['deleteMany'],
  },
});
```

</MdxCard>
