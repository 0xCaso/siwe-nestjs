import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import { JwtService } from '@nestjs/jwt';
import { generateNonce, SiweMessage } from 'siwe';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>, private jwt: JwtService) { }

    async signup(user: UserEntity, message: string, signature: string): Promise<UserEntity> {
        const foundUser = await this.userRepository.findOne({
            where: [
                { username: user.username },
                { address: user.address }
            ]
        });
        if (foundUser) {
            return null;
        }
        const valid = await this.verify(message, signature);
        if (valid) {
            return await this.userRepository.save(user);
        } else {
            return null;
        }
    }

    async signin(address: string, message: string, signature: string) {
        const foundUser = await this.userRepository.findOne({ 
            where: { address: address }
        });
        const valid = await this.verify(message, signature);
        if (foundUser && valid) {
            const payload = { username: foundUser.username, address: foundUser.address };
            return {
                access_token: this.jwt.sign(payload),
            };
        } else {
            return null;
        }
    }

    async getProfile(user: any) {
        return user;
    }

    async exists(address: string) {
        const foundUser = await this.userRepository.findOne({
            where: [
                { address: address }
            ]
        });
        if (foundUser) {
            return true;
        } else {
            return false;
        }
    }

    async nonce() {
        return generateNonce();
    }

    async verify(message: string, signature: string) {
        const siweMessage = new SiweMessage(message);
        try {
            await siweMessage.validate(signature);
            return true;
        } catch {
            return false;
        }
    }
}