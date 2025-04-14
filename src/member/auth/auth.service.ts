import {
	BadRequestException,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { envVarKeys } from '@common/const/env.const';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAuthDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/register.dto';
import { Member } from '../entity/member.entity';

@Injectable()
export class AuthService {

	// constructor(
	// 	@InjectRepository(Member)
	// 	private memberRepository: Repository<Member>,
	// 	@Inject(CACHE_MANAGER) private cacheManager: Cache,
	// 	private jwtService: JwtService,
	// 	private configService: ConfigService,
	// ) {}

	/// rawToken -> "Basic $token"
	// async register(rawToken: string) {
	// 	const { email, password } = this.parseBasicToken(rawToken);
	
	// 	return this.userService.create({
	// 	  email,
	// 	  password,
	// 	});
	// }
}
