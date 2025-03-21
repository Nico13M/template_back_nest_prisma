import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDTO } from './dtos/update-user.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // Création d'un utilisateur
    @Post()
    create(@Body() createUserDTO: CreateUserDTO) {
        return this.userService.create(createUserDTO);
    }
    @Get()
    findAll() {
        return this.userService.findAll();
    }

    // Récupérer un utilisateur par ID
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    // Mettre à jour un utilisateur
    @Put(':id')
    update(@Param('id') id: string, @Body() updateUserDTO: UpdateUserDTO) {
        return this.userService.update(id, updateUserDTO);
    }

    // Supprimer un utilisateur
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }
}
