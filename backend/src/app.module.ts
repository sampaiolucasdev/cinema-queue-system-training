import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RedisModule } from './redis/redis.module.js';
import { TicketsModule } from './tickets/tickets.module.js';

@Module({
  imports: [RedisModule, TicketsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
