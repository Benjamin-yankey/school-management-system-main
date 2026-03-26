import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'school-service', brokers: [process.env.KAFKA_BROKER] },
      consumer: { groupId: 'school-consumer' },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
