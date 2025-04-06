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
  getEndpoint(path: string, method: string): Promise<EndpointEntity | null> {
    throw new Error('Method not implemented.');
  }
  isRouteAndMethodExist(path: string, method: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getEndpointsWithCursor(limit: number, cursor: string): Promise<EndpointEntity[]> {
    throw new Error('Method not implemented.');
  }
  deleteEndpoints(endpointIds: string[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
  updateEndpoints(endpoint: EndpointEntity[]): Promise<any> {
    throw new Error('Method not implemented.');
  }
  assignEndpointsToRoles(
    endpointIds: string[],
    roleIds: string[],
  ): Promise<void> {
    throw new Error('Method not implemented.');
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
    return createdEndpoints.map((doc) => doc.toObject() as any);
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
