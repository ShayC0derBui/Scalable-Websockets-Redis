import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { hostname } from 'os';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
@WebSocketGateway({ port: 3000 })
export class LocationGateway {
  @WebSocketServer() server: Server;
  private redisClient: Redis;
  private redisSubscriber: Redis;
  private riders = {};

  constructor(private configService: ConfigService) {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
    console.log('REDIS_HOST', redisHost);
    console.log('REDIS_PORT', redisPort); //location-socket-websocket_server-1
    console.log('REDIS_PASSWORD', redisPassword);

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
    });
    this.redisClient.on('error', (err) => {
      console.error('Redis error: %s', err.message);
    });
    this.redisSubscriber = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
    });
    this.redisSubscriber.on('error', (err) => {
      console.error('Redis error: %s', err.message);
    });

    this.redisSubscriber.subscribe('locationUpdate', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(
          `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
        );
      }
    });

    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === 'locationUpdate') {
        const { driverId, location } = JSON.parse(message);
        console.log(
          `Received update for driver ${driverId} in the appId: ${hostname()}\n Message: ${message}`,
        );
        this.notifyRiders(driverId, location).then((r) => r);
      }
    });

    console.log(
      `LocationGateway instance created: ${hostname()}-${Date.now()}`,
    );
  }

  @SubscribeMessage('updateLocation')
  async handleUpdateLocation(
    @MessageBody()
    data: {
      driverId: string;
      lat: number;
      lng: number;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const location = { lat: data.lat, lng: data.lng };
    await this.redisClient.hset(
      'driverLocations',
      data.driverId,
      JSON.stringify(location),
    );
    this.redisClient.publish(
      'locationUpdate',
      JSON.stringify({ driverId: data.driverId, location }),
    );
  }

  @SubscribeMessage('subscribeToDriver')
  async handleSubscribeToDriver(
    @MessageBody()
    data: {
      riderId: string;
      driverId: string;
    },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.redisClient.sadd(`riderSubscriptions:${data.driverId}`, data.riderId);
    if (this.riders[client.id] === undefined) {
      this.riders[data.riderId] = client.id;
    }
    console.log('Rider registered:', data.riderId);

    client.on('disconnect', () => {
      console.log('Rider disconnected:', data.riderId);
      delete this.riders[data.riderId];
    });
  }

  @SubscribeMessage('unsubscribeFromDriver')
  async handleUnsubscribeFromDriver(
    @MessageBody() data: { riderId: string; driverId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.redisClient.srem(`riderSubscriptions:${data.driverId}`, data.riderId);
  }

  private async notifyRiders(
    driverId: string,
    location: { lat: number; lng: number },
  ): Promise<void> {
    const riders = await this.redisClient.smembers(
      `riderSubscriptions:${driverId}`,
    );
    riders.forEach((riderId) => {
      const clientId = this.riders[riderId];
      this.server
        .to(clientId)
        .emit('locationUpdate', { driverId, ...location });
    });
  }
}
