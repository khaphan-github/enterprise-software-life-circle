import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EndpointEntity } from '../../../domain/endpoint/endpoint-entity';
import { IEndpointRepository } from '../../../domain/repository/endpoint-repository.interface';
import { Endpoint, EndpointDocument } from './schema/endpoint.schema';

@Injectable()
export class EndpointMongoRepository implements IEndpointRepository {
  constructor(
    @InjectModel(Endpoint.name)
    private readonly endpointModel: Model<EndpointDocument>,
  ) {}

  async getEndpoint(
    path: string,
    method: string,
  ): Promise<EndpointEntity | null> {
    const endpoint = await this.endpointModel.findOne({ path, method }).exec();
    return endpoint ? (endpoint.toObject() as unknown as EndpointEntity) : null;
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
    return endpoints.map((doc) => doc.toObject() as unknown as EndpointEntity);
  }

  async deleteEndpoints(endpointIds: string[]): Promise<void> {
    await this.endpointModel.deleteMany({ _id: { $in: endpointIds } }).exec();
  }

  async updateEndpoints(endpoints: EndpointEntity[]): Promise<void> {
    const bulkOps = endpoints.map((endpoint) => ({
      updateOne: {
        filter: { _id: endpoint.id },
        update: { $set: endpoint },
      },
    }));
    await this.endpointModel.bulkWrite(bulkOps);
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
  ): Promise<EndpointEntity[] | null> {
    const createdEndpoints = await this.endpointModel.insertMany(
      endpoints.map((endpoint) => ({
        ...endpoint,
        _id: endpoint.id, // Use the provided endpoint.id as the document ID
      })),
    );
    return createdEndpoints.map(
      (doc) => doc.toObject() as unknown as EndpointEntity,
    );
  }

  async updateEndpoint(endpoint: EndpointEntity): Promise<void> {
    await this.endpointModel.updateOne({ _id: endpoint.id }, endpoint).exec();
  }

  async deleteEndpoint(endpointId: string): Promise<void> {
    await this.endpointModel.deleteOne({ _id: endpointId }).exec();
  }

  async findEndpointByPathAndMethod(
    path: string,
    method: string,
  ): Promise<EndpointEntity | null> {
    const endpoint = await this.endpointModel.findOne({ path, method }).exec();
    return endpoint ? (endpoint.toObject() as unknown as EndpointEntity) : null;
  }

  async findEndpointById(id: string): Promise<EndpointEntity | null> {
    const endpoint = await this.endpointModel.findById(id).exec();
    return endpoint ? (endpoint.toObject() as unknown as EndpointEntity) : null;
  }
}
