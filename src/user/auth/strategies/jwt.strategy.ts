import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly prisma: PrismaService,
        config_service: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config_service.get('JWT_SECRET'),
        });
    }

    async validate(payload: {email: string, id: number}) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.id
            }
        });
        if(!user){
            throw new UnauthorizedException();
        }
        return user;
    }
}