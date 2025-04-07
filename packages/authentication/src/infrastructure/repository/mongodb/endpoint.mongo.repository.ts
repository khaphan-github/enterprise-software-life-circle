import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EndpointEntity,
  EndpointStatus,
} from '../../../domain/endpoint/endpoint-entity';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { Endpoint, EndpointDocument } from './schema/endpoint.schema';
import { MongoIdGenerator } from '../../../domain/entity/id';

@Injectable()
export class EndpointMongoRepository implements IEndpointRepository {
  private readonly idGenerator: MongoIdGenerator;

  constructor(
    @InjectModel(Endpoint.name)
    private readonly endpointModel: Model<EndpointDocument>,
  ) {
    this.idGenerator = new MongoIdGenerator();
  }

  private toEntity(doc: EndpointDocument | null): EndpointEntity | null {
    if (!doc) return null;
    const obj = doc.toObject();
    const entity = new EndpointEntity();
    entity.initId(this.idGenerator);
    entity.id = obj._id.toString(); // Override with stored ID
    entity.path = obj.path;
    entity.method = obj.method;
    entity.status = obj.status as EndpointStatus;
    entity.metadata = obj.metadata || {};
    const timestamps = obj as unknown as { createdAt?: Date; updatedAt?: Date };
    if (timestamps.createdAt) entity.setCreateTime();
    if (timestamps.updatedAt) entity.setUpdateTime();
    return entity;
  }

  async getEndpoint(
    path: string,
    method: string,
  ): Promise<EndpointEntity | null> {
    const endpoint = await this.endpointModel.findOne({ path, method }).exec();
    return this.toEntity(endpoint);
  }

  async isRouteAndMethodExist(path: string, method: string): Promise<boolean> {
    const count = await this.endpointModel
      .countDocuments({ path, method })
      .exec();
    return count > 0;
  }

  async getEndpointsWithCursor(
    limit: number,
    cursor: string,
  ): Promise<EndpointEntity[]> {
    const query = cursor ? { _id: { $gt: cursor } } : {};
    const endpoints = await this.endpointModel
      .find(query)
      .limit(limit)
      .sort({ _id: 1 })
      .exec();
    return endpoints.map((doc) => this.toEntity(doc)!);
  }

  async deleteEndpoints(endpointIds: string[]): Promise<void> {
    await this.endpointModel.deleteMany({ _id: { $in: endpointIds } }).exec();
  }

  async updateEndpoints(
    endpoints: EndpointEntity[],
  ): Promise<EndpointEntity[]> {
    const updatePromises = endpoints.map(async (endpoint) => {
      const update = {
        path: endpoint.path,
        method: endpoint.method,
        status: endpoint.status,
        metadata: endpoint.metadata,
      };
      const doc = await this.endpointModel
        .findByIdAndUpdate(endpoint.id, update, { new: true })
        .exec();
      return this.toEntity(doc);
    });
    const updatedEndpoints = await Promise.all(updatePromises);
    return updatedEndpoints.filter(
      (endpoint): endpoint is EndpointEntity => endpoint !== null,
    );
  }

  async assignEndpointsToRoles(
    endpointIds: string[],
    roleIds: string[],
  ): Promise<void> {
    await this.endpointModel
      .updateMany(
        { _id: { $in: endpointIds } },
        { $addToSet: { roles: { $each: roleIds } } },
      )
      .exec();
  }

  async createEndpoints(
    endpoints: EndpointEntity[],
  ): Promise<EndpointEntity[]> {
    const createdEndpoints = await this.endpointModel.insertMany(
      endpoints.map((endpoint) => {
        if (!endpoint.id) {
          endpoint.initId(this.idGenerator);
        }
        return {
          _id: endpoint.id,
          path: endpoint.path,
          method: endpoint.method,
          status: endpoint.status,
          metadata: endpoint.metadata,
        };
      }),
    );
    return createdEndpoints.map((doc) => this.toEntity(doc)!);
  }

  async updateEndpoint(endpoint: EndpointEntity): Promise<void> {
    await this.endpointModel.updateOne(
      { _id: endpoint.id },
      {
        path: endpoint.path,
        method: endpoint.method,
        status: endpoint.status,
        metadata: endpoint.metadata,
      },
    ).exec();
  }

  async deleteEndpoint(endpointId: string): Promise<void> {
    await this.endpointModel.deleteOne({ _id: endpointId }).exec();
  }

  async findEndpointByPathAndMethod(
    path: string,
    method: string,
  ): Promise<EndpointEntity | null> {
    const endpoint = await this.endpointModel.findOne({ path, method }).exec();
    return this.toEntity(endpoint);
  }

  async findEndpointById(id: string): Promise<EndpointEntity | null> {
    const endpoint = await this.endpointModel.findById(id).exec();
    return this.toEntity(endpoint);
  }
}
