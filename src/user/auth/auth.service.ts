import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { promisify } from 'util';
const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt_service: JwtService,
        private readonly config_service: ConfigService
    ){}

    private async hashPassword(password: string){
        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        const result = salt + '.' + hash.toString('hex');

        return result;
    }

    private async verifyPassword(password: string, salt_hashed_password: string){
        const [salt, hashed_password] = salt_hashed_password.split('.');
        const hashed_password_new = ((await scrypt(password, salt, 32)) as Buffer).toString('hex');

        return hashed_password === hashed_password_new;
    }

    private generateToken(email: string, id: number){
        const payload = { email, id };
        const access_token = this.jwt_service.sign(payload, {
            secret: this.config_service.get('JWT_SECRET'),
            expiresIn: this.config_service.get('JWT_EXP_H')
        });

        return {access_token};
    }

    signIn(id: number, email: string){
        
        return this.generateToken(email, id);
    }

    async signUp(
        email: string,
        password: string,
    ){
        const user = await this.prisma.user.create({
            data: {
                email,
                password,
                balance: 0
            }
        });

        return this.generateToken(user.email, user.id);
    }

    async validateUser(email: string, password: string){
        const user = await this.prisma.user.findUnique({
            where: {
                email
            }
        });

        if(!user){
            throw new UnauthorizedException('username or password is incorrect');
        }

        const password_check = await this.verifyPassword(password, user.password);

        if(!password_check){
            throw new UnauthorizedException('username or password is incorrect');
        }

        return user;
    }
}
