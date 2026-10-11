import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { TicketsController } from './tickets.controller.js';
import { RedisModule } from '../redis/redis.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [RedisModule, PrismaModule], // <-- Importante para injetar o RedisService e PrismaService
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
