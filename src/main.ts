import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { envs } from './common/envs';

async function bootstrap() {
  const logger = new Logger('Server-ms')
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.NATS,
    options: {
      servers: envs.NATS_SERVERS,
    },
  });
  await app.listen();

   
  const ws = await NestFactory.create(AppModule);
  
  ws.enableCors({
    origin: envs.FRONTEND_URL,
    credentials: true,
  });
  await ws.listen(envs.WS_PORT);

  logger.log('Server-ms Microservice is running');
  logger.log(`Server-ms Websocket is running on port ${envs.WS_PORT}`);
}
bootstrap();
