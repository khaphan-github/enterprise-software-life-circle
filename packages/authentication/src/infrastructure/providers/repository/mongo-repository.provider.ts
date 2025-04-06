import { Model } from 'mongoose';
import {
  User,
  UserDocument,
} from '../../repository/mongodb/schema/user.schema';
import { UserMongoRepository } from '../../repository/mongodb/user.mongo.repository';
import { getModelToken } from '@nestjs/mongoose';
import { USER_REPOSITORY_PROVIDER } from './repository-providers';
import { Provider } from '@nestjs/common';

export const MongoRepositoryProviders: Provider[] = [
  {
    provide: USER_REPOSITORY_PROVIDER,
    useFactory: (userModel: Model<UserDocument>) => {
      return new UserMongoRepository(userModel);
    },
    inject: [getModelToken(User.name)],
  },
];
