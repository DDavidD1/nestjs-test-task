import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    get(id: number){
        return this.prisma.user.findUnique({
            where: {
                id
            }
        });
    }

    remove(id: number){
        return this.prisma.user.delete({
            where: {
                id
            }
        });
    }
}
