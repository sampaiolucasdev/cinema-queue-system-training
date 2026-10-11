import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global() // Torna o Prisma disponivel globalmente na aplicacao sem precisar importar toda vez
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
