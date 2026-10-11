import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('reserve')
  @HttpCode(HttpStatus.CREATED)
  async reserve(
    @Body() body: { sessionId: string; seatNumber: number; userId: string },
  ) {
    return this.ticketsService.reserveSeat(
      body.sessionId,
      body.seatNumber,
      body.userId,
    );
  }
}
