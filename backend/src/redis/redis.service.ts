import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {Redis} from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  onModuleInit() {
    // Inicializa a conexão com o Redis usando a variável de ambiente ou padrão local
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  onModuleDestroy() {
    // Fecha a conexão ao desligar a aplicação
    this.client.quit();
  }

  // Tenta travar um assento por um tempo determinado (ex: 300 segundos / 5 minutos)
  async lockSeat(
    sessionId: string,
    seatNumber: number,
    ttlSeconds: number = 300,
  ): Promise<boolean> {
    const lockKey = `lock:session:${sessionId}:seat:${seatNumber}`;

    // O comando SET com a opção 'NX' garante que a chave só será criada se ela NÃO existir.
    // A opção 'EX' define o tempo de expiração em segundos (caso o usuário desista ou feche a aba).
    const result = await this.client.set(
      lockKey,
      'LOCKED',
      'EX',
      ttlSeconds,
      'NX',
    );

    // Se 'result' for 'OK', significa que conseguimos o lock com sucesso.
    // Se for null, significa que o assento já está travado por outra requisição.
    return result === 'OK';
  }

  // Libera o lock caso o usuário cancele a intenção de compra
  async unlockSeat(sessionId: string, seatNumber: number): Promise<void> {
    const lockKey = `lock:session:${sessionId}:seat:${seatNumber}`;
    await this.client.del(lockKey);
  }
}
