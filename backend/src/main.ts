import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o CORS para o frontend conseguir se comunicar com o backend
  app.enableCors();

  // Alterado para a porta 3333 para não conflitar com o Next.js (porta 3000)
  await app.listen(3333);
}
bootstrap();
