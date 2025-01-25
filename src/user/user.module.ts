import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from './user.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot()],
      useFactory: async (config_service: ConfigService) => ({
          secret: config_service.get('JWT_SECRET'),
          signOptions: {
              expiresIn: config_service.get('JWT_EXP_H'),
          }
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    UserController,
    AuthController,
  ],
  providers: [PrismaService, UserService, AuthService, JwtService, ConfigService]
})
export class UserModule {}
