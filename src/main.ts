import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector)); // Bảo vệ toàn cục
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*', // Tất cả tên miền đuề đc phép truy cập
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  const port = configService.get<string>('PORT');
  await app.listen(port);
  console.log(`Listening port ${port}`);
}
bootstrap();
