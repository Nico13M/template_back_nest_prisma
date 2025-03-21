import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDTO } from './dtos/sign-up.dto';
import { SignInDTO } from './dtos/sign-in.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }
    @Post('signin')
    async signIn(@Body() signInDTO: SignInDTO, @Res({ passthrough: true }) res: Response) {
        await this.authService.signIn(signInDTO, res);
        return { statusCode: HttpStatus.OK };
    }


    @Post('signup')
    async signUp(@Body() signUpDTO: SignUpDTO, @Res({ passthrough: true }) res: Response,) {
        await this.authService.signUp(signUpDTO, res);
        return { statusCode: HttpStatus.CREATED };
    }

}
