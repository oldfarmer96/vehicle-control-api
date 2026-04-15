import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'fatal', 'verbose'],
  });

  app.use(cookieParser());
  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService);

  const isProd = configService.get('NODE_ENV') === 'production';
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = configService
    .get<string>('CORS_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: isProd ? corsOrigins : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health'],
  });

  app.enableShutdownHooks();

  const port = configService.get<number>('PORT', 5000);
  const nodeEnv = configService.get<string>('NODE_ENV');

  await app.listen(port, '0.0.0.0');
  logger.log(
    `Application is running on: ${await app.getUrl()}, NODE_ENV: ${nodeEnv},`,
  );
}
bootstrap();
