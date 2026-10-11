import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async reserveSeat(sessionId: string, seatNumber: number, userId: string) {
    // 1. Validar se a sessão do cinema realmente existe
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sessão de cinema não encontrada.');
    }

    if (seatNumber < 1 || seatNumber > session.totalSeats) {
      throw new ConflictException(
        'Número de assento inválido para esta sessão.',
      );
    }

    // 2. Tentar obter o Lock no Redis (expira em 300 segundos / 5 minutos)
    const acquiredLock = await this.redisService.lockSeat(
      sessionId,
      seatNumber,
      300,
    );

    if (!acquiredLock) {
      throw new ConflictException(
        'Este assento já está temporariamente reservado ou ocupado por outro usuário.',
      );
    }

    try {
      // 3. Tentar salvar no PostgreSQL
      const ticket = await this.prisma.ticket.create({
        data: {
          sessionId,
          seatNumber,
          userId,
          status: 'PENDING',
        },
      });

      return {
        message: 'Assento reservado com sucesso! Conclua o pagamento.',
        ticket,
      };
    } catch (error) {
      // Se o banco relacional rejeitar, liberamos o lock no Redis
      await this.redisService.unlockSeat(sessionId, seatNumber);
      throw new ConflictException(
        'Assento já foi comprado ou está indisponível.',
      );
    }
  }
}
