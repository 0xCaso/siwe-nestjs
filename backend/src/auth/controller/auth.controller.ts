import { Controller, Request, Post, Get, UseGuards, Body } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { UserEntity } from '../user.entity';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('user/')
export class AuthController {
    constructor(private usersService: AuthService) { }

    @Post('signup')
    async signup(@Body() body: JSON): Promise<UserEntity> {
        const user = new UserEntity();
        user.username = body['username'];
        user.address = body['address'];
        const message = body['message'];
        const signature = body['signature'];
        return await this.usersService.signup(user, message, signature);
    }

    @Post('signin')
    async signin(@Body() body: JSON) {
        const address = body['address'];
        const message = body['message'];
        const signature = body['signature'];
        return this.usersService.signin(address, message, signature)
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        return this.usersService.getProfile(req.user)
    }

    @Post('exists')
    async exists(@Request() req) {
        const foundUser = await this.usersService.exists(req.body.address);
        return foundUser;
    }

    @Get('nonce')
    async getNonce() {
        return this.usersService.nonce();
    }

    @Post('verify')
    async verify(@Request() req) {
        const { message, signature } = req.body;
        return this.usersService.verify(message, signature);
    }
}