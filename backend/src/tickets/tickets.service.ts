import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async reserveSeat(sessionId: string, seatNumber: number, userId: string) {
    // 1. Verificar se a sessão existe
    let session = await this.prisma.session.findUnique({
      where: { id: sessionId as any },
    });

    if (!session) {
      // Garante que existe um filme padrão para satisfazer a relação obrigatória
      let movie = await this.prisma.movie.findUnique({
        where: { id: 'movie-default' as any },
      });

      if (!movie) {
        movie = await this.prisma.movie.create({
          data: {
            id: 'movie-default',
            title: 'Filme de Demonstração',
            duration: 120,
          } as any,
        });
      }

      // Cria a sessão vinculada ao filme padrão
      session = await this.prisma.session.create({
        data: {
          id: sessionId,
          totalSeats: 50,
          startTime: new Date(),
          movieId: movie.id,
        } as any,
      });
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
        'Este assento já está temporariamente reservado ou ocupado por outro utilizador.',
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
        } as any,
      });

      return {
        message: 'Assento reservado com sucesso! Conclua o pagamento.',
        ticket,
      };
    } catch (error) {
      // Se o banco relacional rejeitar, liberamos o lock no Redis
      await this.redisService.unlockSeat(sessionId, seatNumber);
      throw new ConflictException(
        'Este assento já foi comprado ou está indisponível.',
      );
    }
  }
}
