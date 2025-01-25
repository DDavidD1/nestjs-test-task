import { IsEmail, IsStrongPassword } from "class-validator";

export class UserSignupDTO{
    @IsEmail()
    email: string

    @IsStrongPassword()
    password: string
}