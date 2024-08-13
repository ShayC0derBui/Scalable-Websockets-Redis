import { Module } from '@nestjs/common';
import { AppController } from './controllers/entry-point/app.controller';
import { AppService } from './services/entry-point/app.service';
import { LocationModule } from './socket-gateway/location.module';

@Module({
  imports: [LocationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
