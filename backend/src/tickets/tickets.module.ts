import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { TicketsController } from './tickets.controller.js';
import { RedisModule } from '../redis/redis.module.js';

@Module({
  imports: [RedisModule], // <-- Importante para injetar o RedisService
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
