import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { SignUpDTO } from './dtos/sign-up.dto';
import { SignInDTO } from './dtos/sign-in.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
        private readonly jwt: JwtService,
    ) { }

    async signUp(signUpDTO: SignUpDTO, res: Response) {
        const hashedPassword = await this.hashPassword(signUpDTO.password);
        try {
            const user = await this.prisma.user.create({
                data: {
                    firstName: signUpDTO.firstName,
                    lastName: signUpDTO.lastName,
                    email: signUpDTO.email,
                    hashPassword: hashedPassword
                },
            });

            const token = await this.signToken(user.id, user.email);
            this.setCookie(res, token.access_token);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ForbiddenException('Credentials taken');
            }
            throw error;
        }
    }

    async signIn(signInDTO: SignInDTO, res: Response) {
        const user = await this.prisma.user.findUnique({
            where: { email: signInDTO.email },
        });
        if (!user) {
            throw new ForbiddenException('Invalid credentials');
        }
        const passwordMatches = await this.verifyPassword(
            user.hashPassword,
            signInDTO.password,
        );
        if (!passwordMatches) {
            throw new ForbiddenException('Invalid credentials');
        }
        const token = await this.signToken(user.id, user.email);
        this.setCookie(res, token.access_token);
    }

    private async hashPassword(password: string): Promise<string> {
        return argon.hash(password);
    }

    private async verifyPassword(
        hashedPassword: string,
        plainPassword: string,
    ): Promise<boolean> {
        return argon.verify(hashedPassword, plainPassword);
    }

    private async signToken(
        userId: string,
        email: string,
    ): Promise<{ access_token: string }> {
        const payload = { sub: userId, email };
        const secret = this.config.get<string>('JWT_SECRET');
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: secret,
        });
        return { access_token: token };
    }

    private setCookie(res: Response, token: string): void {
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: false, // il faut metre ca à true en production avec HTTPS
            maxAge: 15 * 60 * 1000, // 15 minutes
        });
    }
}