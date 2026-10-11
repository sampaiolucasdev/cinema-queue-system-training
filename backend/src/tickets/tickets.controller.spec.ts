import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import { ConflictException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('TicketsService - Concurrency & Booking', () => {
  let ticketsService: TicketsService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: {
            session: {
              findUnique: vi.fn().mockResolvedValue({
                id: 'session-123',
                totalSeats: 50,
              }),
            },
            ticket: {
              create: vi.fn().mockResolvedValue({
                id: 'ticket-abc',
                sessionId: 'session-123',
                seatNumber: 10,
                status: 'PENDING',
                userId: 'user-1',
              }),
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            lockSeat: vi.fn(),
            unlockSeat: vi.fn(),
          },
        },
      ],
    }).compile();

    ticketsService = module.get<TicketsService>(TicketsService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('deve permitir a reserva se o lock no Redis for adquirido com sucesso', async () => {
    // Usamos vi.spyOn em vez de jest.spyOn
    vi.spyOn(redisService, 'lockSeat').mockResolvedValue(true);

    const result = await ticketsService.reserveSeat(
      'session-123',
      10,
      'user-1',
    );

    expect(result).toBeDefined();
    expect(result.ticket.seatNumber).toBe(10);
    expect(redisService.lockSeat).toHaveBeenCalledTimes(1);
  });

  it('deve bloquear múltiplos usuários tentando reservar o MESMO assento simultaneamente', async () => {
    const lockMock = vi.spyOn(redisService, 'lockSeat');
    lockMock.mockResolvedValueOnce(true).mockResolvedValueOnce(false);

    const attempt1 = ticketsService.reserveSeat('session-123', 15, 'user-1');
    const attempt2 = ticketsService.reserveSeat('session-123', 15, 'user-2');

    await expect(attempt1).resolves.toBeDefined();
    await expect(attempt2).rejects.toThrow(ConflictException);
  });
});
