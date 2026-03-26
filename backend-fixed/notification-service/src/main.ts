import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'notification-service', brokers: [process.env.KAFKA_BROKER] },
      consumer: { groupId: 'notification-consumer' },
    },
  });

  await app.startAllMicroservices();
  await app.init();
}
bootstrap();
