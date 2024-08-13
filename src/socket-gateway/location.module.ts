import { Module } from '@nestjs/common';
import { LocationGateway } from './location.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [LocationGateway],
  exports: [LocationGateway],
})
export class LocationModule {}
