import { Model } from 'mongoose';
import {
  User,
  UserDocument,
} from '../../repository/mongodb/schema/user.schema';
import { UserMongoRepository } from '../../repository/mongodb/user.mongo.repository';
import { getModelToken } from '@nestjs/mongoose';
import {
  USER_REPOSITORY_PROVIDER,
  ACTION_REPOSITORY_PROVIDER,
  ENDPOINT_REPOSITORY_PROVIDER,
  ROLE_REPOSITORY_PROVIDER,
} from './repository-providers';
import { Provider } from '@nestjs/common';
import { Action, ActionDocument } from '../../repository/mongodb/schema/action.schema';
import { Endpoint, EndpointDocument } from '../../repository/mongodb/schema/endpoint.schema';
import { Role, RoleDocument } from '../../repository/mongodb/schema/role.schema';
import { ActionMongoRepository } from '../../repository/mongodb/action.mongo.repository';
import { EndpointMongoRepository } from '../../repository/mongodb/endpoint.mongo.repository';
import { RoleMongoRepository } from '../../repository/mongodb/role.mongo.repository';

export const MongoRepositoryProviders: Provider[] = [
  {
    provide: USER_REPOSITORY_PROVIDER,
    useFactory: (userModel: Model<UserDocument>) => {
      return new UserMongoRepository(userModel);
    },
    inject: [getModelToken(User.name)],
  },
  {
    provide: ACTION_REPOSITORY_PROVIDER,
    useFactory: (actionModel: Model<ActionDocument>) => {
      return new ActionMongoRepository(actionModel);
    },
    inject: [getModelToken(Action.name)],
  },
  {
    provide: ENDPOINT_REPOSITORY_PROVIDER,
    useFactory: (endpointModel: Model<EndpointDocument>) => {
      return new EndpointMongoRepository(endpointModel);
    },
    inject: [getModelToken(Endpoint.name)],
  },
  {
    provide: ROLE_REPOSITORY_PROVIDER,
    useFactory: (roleModel: Model<RoleDocument>) => {
      return new RoleMongoRepository(roleModel);
    },
    inject: [getModelToken(Role.name)],
  },
];
