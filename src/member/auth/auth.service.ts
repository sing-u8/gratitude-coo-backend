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
import { Member } from '@member/entity/member.entity';
import { MemberService } from '@member/member.service';

@Injectable()
export class AuthService {

	constructor(
		@InjectRepository(Member)
		private memberRepository: Repository<Member>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private jwtService: JwtService,
		private configService: ConfigService,
		private memberService: MemberService,
	) {}

	async tokenBlock(token: string) {
		const payload = this.jwtService.decode(token);
	
		const expiryDate = Number(new Date(payload?.exp * 1000));
		const now = +Date.now();
	
		const differenceInSeconds = (expiryDate - now) / 1000;
	
		await this.cacheManager.set(
		  `BLOCK_TOKEN_${token}`,
		  payload,
		  Math.max(differenceInSeconds * 1000, 1),
		);
	
		return true;
	  }
	
	  parseBasicToken(rawToken: string) {
		/// 1) 토큰을 ' ' 기준으로 스플릿 한 후 토큰 값만 추출하기
		/// ['Basic', $token]
		const basicSplit = rawToken.split(' ');
	
		if (basicSplit.length !== 2) {
		  throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
		}
	
		const [basic, token] = basicSplit;
	
		if (basic.toLowerCase() !== 'basic') {
		  throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
		}
	
		/// 2) 추출한 토큰을 base64 디코딩해서 이메일과 비밀번호로 나눈다.
		const decoded = Buffer.from(token, 'base64').toString('utf-8');
	
		/// "email:password"
		/// [email, password]
		const tokenSplit = decoded.split(':');
	
		if (tokenSplit.length !== 2) {
		  throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
		}
	
		const [email, password] = tokenSplit;
	
		return {
		  email,
		  password,
		};
	  }
	
	  async parseBearerToken(rawToken: string, isRefreshToken: boolean) {
		const basicSplit = rawToken.split(' ');
	
		if (basicSplit.length !== 2) {
		  throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
		}
	
		const [bearer, token] = basicSplit;
	
		if (bearer.toLowerCase() !== 'bearer') {
		  throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
		}
	
		try {
		  const payload = await this.jwtService.verifyAsync(token, {
			secret: this.configService.get<string>(
			  isRefreshToken
				? envVarKeys.JWT_REFRESH_SECRET
				: envVarKeys.JWT_SECRET,
			),
		  });
	
		  if (isRefreshToken) {
			if (payload.type !== 'refresh') {
			  throw new BadRequestException('Refresh 토큰을 입력 해주세요!');
			}
		  } else {
			if (payload.type !== 'access') {
			  throw new BadRequestException('Access 토큰을 입력 해주세요!');
			}
		  }
	
		  return payload;
		} catch (_) {
		  throw new UnauthorizedException('토큰이 만료됐습니다!');
		}
	  }
	
	  /// rawToken -> "Basic $token"
	  async register(rawToken: string) {
		const { email, password } = this.parseBasicToken(rawToken);
	
		return this.memberService.create({
		  email,
		  password,
		  name: "",
		  nickname: "",
		});
	  }
	
	  async authenticate(email: string, password: string) {

		const user = await this.memberRepository.findOne({
		    where: {
		        email,
		    },
		});
	
		if (!user) {
		  throw new BadRequestException('잘못된 로그인 정보입니다!');
		}
	
		const passOk = await bcrypt.compare(password, user.password);
	
		if (!passOk) {
		  throw new BadRequestException('잘못된 로그인 정보입니다!');
		}
	
		return user;
	  }
	
	  async issueToken(user: Member, isRefreshToken: boolean) {
		const refreshTokenSecret = this.configService.get<string>(
		  envVarKeys.JWT_REFRESH_SECRET,
		);
		const accessTokenSecret = this.configService.get<string>(
		  envVarKeys.JWT_SECRET,
		);
	
		return this.jwtService.signAsync(
		  {
			sub: user.id,
			type: isRefreshToken ? 'refresh' : 'access',
		  },
		  {
			secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
			expiresIn: isRefreshToken ? '24h' : 300,
		  },
		);
	  }
	
	  async login(rawToken: string) {
		const { email, password } = this.parseBasicToken(rawToken);
	
		const user = await this.authenticate(email, password);
	
		return {
		  refreshToken: await this.issueToken(user, true),
		  accessToken: await this.issueToken(user, false),
		};
	  }
}
