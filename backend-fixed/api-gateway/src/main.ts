import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
 feature/styling

  // Enable CORS for frontend communication
  app.enableCors({
 feature/setup-backend

    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

main
  app.enableCors({
main
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://2e57-196-61-44-164.ngrok-free.app',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });
feature/setup-backend
  // ...existing code...

 feature/styling

  main
 main
main
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
