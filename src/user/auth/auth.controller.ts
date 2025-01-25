import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserSignupDTO } from './dtos/user-signup.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth_service: AuthService
    ){}

    @UseGuards(AuthGuard('local'))
    @Post('signin')
    signIn(@Request() req){
        return this.auth_service.signIn(req.user.id, req.user.email);
    }

    @Post('signup')
    signUp(@Body() body: UserSignupDTO){
        return this.auth_service.signUp(body.email, body.password);
    }
}
