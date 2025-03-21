import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDTO } from './dtos/update-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    // Hachage du mot de passe
    private async hashPassword(password: string): Promise<string> {
        return argon2.hash(password);
    }


    // Création d'un utilisateur
    async create(createUserDTO: CreateUserDTO) {
        const { firstName, lastName, email, password } = createUserDTO;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new ForbiddenException('Email already exists');
        }

        // Hachage du mot de passe
        const hashedPassword = await this.hashPassword(password);

        const user = await this.prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                hashPassword: hashedPassword,
            },
        });

        return user;
    }

    async findAll() {
        return this.prisma.user.findMany();
    }

    // Récupérer un utilisateur par ID
    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    // Mettre à jour un utilisateur
    async update(id: string, updateUserDTO: UpdateUserDTO) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Si un mot de passe est inclus, on le hache
        if (updateUserDTO.password) {
            updateUserDTO.password = await this.hashPassword(updateUserDTO.password);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: updateUserDTO,
        });

        return updatedUser;
    }

    // Supprimer un utilisateur
    async remove(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        await this.prisma.user.delete({
            where: { id },
        });

        return { message: `User with ID ${id} deleted successfully` };
    }
}
