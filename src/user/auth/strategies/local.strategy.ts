import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private readonly auth_service: AuthService){
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string){
        const user = await this.auth_service.validateUser(email, password);
        return user;
    }
}