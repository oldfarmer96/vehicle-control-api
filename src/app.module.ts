import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env.config';
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { PersonsModule } from './modules/persons/persons.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { AccessEventsModule } from './modules/access-events/access-events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envSchema,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    PersonsModule,
    RegistrationsModule,
    AccessEventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
