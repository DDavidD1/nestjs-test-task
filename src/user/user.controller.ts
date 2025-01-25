import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
    constructor(
        private readonly user_service: UserService
    ){}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    getSelf(@Request() req){
        return this.user_service.get(req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    removeSelf(@Request() req){
        return this.user_service.remove(req.user.id);
    }
}
