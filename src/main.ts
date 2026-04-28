import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import helmet from 'helmet';
import favicon from 'serve-favicon';
import { join } from 'path';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'fatal', 'verbose'],
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  const logger = new Logger('bootstrap');
  const configService = app.get(ConfigService);

  const cookieSecret = configService.get('COOKIE_SECRET');

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.use(
    compression(),
    helmet(),
    rateLimit({
      windowMs: 10 * 60 * 1000,
      limit: 200,
      handler: (_, res) => {
        res.status(429).json({
          statusCode: 429,
          error: 'Demasiadas peticiones',
          message:
            'Has excedido el límite de solicitudes. Intenta de nuevo en 15 minutos.',
        });
      },
    }),
    cookieParser(cookieSecret),
    favicon(join(__dirname, '..', 'public', 'favicon.ico')),
  );

  const isProd = configService.get('NODE_ENV') === 'prod';
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

  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('Control de vehiculos')
      .setDescription('Control vehicular de entrada y salida')
      .setVersion('1.0')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory);
  }

  const apiPrefix = configService.get<string>('API_PREFIX', 'api');

  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', '/'],
  });

  app.enableShutdownHooks();

  const port = configService.get<number>('PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV');

  await app.listen(port, '0.0.0.0');
  logger.log(
    `Application is running on: ${await app.getUrl()}, NODE_ENV: ${nodeEnv},`,
  );
}
bootstrap();
