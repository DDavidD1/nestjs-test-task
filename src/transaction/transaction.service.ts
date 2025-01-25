import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TransactionType } from './types/transaction';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class TransactionService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cache_manager: Cache
    ){}

    private getCacheKey = (user_id: number) => `user_${user_id}_transactions`;

    private async updateCache(
        user_id: number,
        transaction: {
            id: number;
            user_id: number;
            action: string;
            amount: number;
            ts: Date;
        }
    ){
        let user_transactions = await this.cache_manager.get<(typeof transaction)[]>(this.getCacheKey(user_id));
        if(user_transactions == null){
            user_transactions = [];
        }
        user_transactions.unshift(transaction);

        await this.cache_manager.set(this.getCacheKey(user_id), user_transactions);
    }

    async getTrasactionsHistory(user_id: number){
        const user_cached_transactions = await this.cache_manager.get(this.getCacheKey(user_id));
        if(user_cached_transactions != null){
            return user_cached_transactions;
        }

        const user_transactions = await this.prisma.transactionHistory.findMany({
            where: {
                user_id
            },
            orderBy: {
                ts: 'desc'
            }
        });

        this.cache_manager.set(this.getCacheKey(user_id), user_transactions);

        return user_transactions;
    }

    async withdraw(user_id: number, balance: number){
        if(balance < 100){
            throw new BadRequestException('Balance is less than 100');
        }

        const [_user_update, transaction] = await this.prisma.$transaction([
            this.prisma.user.update({
                data: {
                    balance: balance - 100
                },
                where: {
                    id: user_id
                }
            }),
            this.prisma.transactionHistory.create({
                data: {
                    user_id,
                    action: TransactionType.WITHDRAW,
                    amount: 100,
                    ts: new Date()
                }
            }),
        ]);

        this.updateCache(user_id, transaction);

        return {
            success: 'Successfully withdrawed 100'
        }
    }

    async deposit(user_id: number, balance: number){
        const [_user_update, transaction] = await this.prisma.$transaction([
            this.prisma.user.update({
                data: {
                    balance: balance + 100
                },
                where: {
                    id: user_id
                }
            }),
            this.prisma.transactionHistory.create({
                data: {
                    user_id,
                    action: TransactionType.DEPOSIT,
                    amount: 100,
                    ts: new Date()
                }
            }),
        ]);

        this.updateCache(user_id, transaction);

        return {
            success: 'Successfully deposited 100'
        }
    }
}
