import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService } from './transaction.service';

@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionController {
    constructor(
        private readonly transaction_service: TransactionService
    ){}

    @Get()
    getTrasactionsHistory(@Request() req){
        return this.transaction_service.getTrasactionsHistory(req.user.id);
    }

    @Post('withdraw')
    withdraw(@Request() req){
        return this.transaction_service.withdraw(req.user.id, req.user.balance);
    }

    @Post('deposit')
    deposit(@Request() req){
        return this.transaction_service.deposit(req.user.id, req.user.balance);
    }
}
