import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	LoggerService,
	NestMiddleware,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { envVarKeys } from "src/common/const/env.const";

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache,
		@Inject(WINSTON_MODULE_NEST_PROVIDER)
		private readonly logger: LoggerService,
	) {}

	async use(req: Request, _: Response, next: NextFunction) {
		const authHeader = req.headers.authorization;

		this.logger.log(`bearer token middleware authHeader: ${authHeader}`);

		if (!authHeader) {
			next();
			return;
		}

		const token = this.validateBearerToken(authHeader);
		this.logger.log(`bearer token middleware --- token: ${token}`);

		const blockedToken = await this.cacheManager.get(`BLOCK_TOKEN_${token}`);

		if (blockedToken) {
			throw new UnauthorizedException("차단된 토큰입니다!");
		}

		const tokenKey = `TOKEN_${token}`;

		const cachedPayload = await this.cacheManager.get(tokenKey);

		if (cachedPayload) {
			req.user = cachedPayload;

			return next();
		}

		const decodedPayload = this.jwtService.decode(token);
		this.logger.log(
			`bearer token middleware --- decodedPayload: ${JSON.stringify(decodedPayload)}`,
		);

		if (decodedPayload.type !== "refresh" && decodedPayload.type !== "access") {
			throw new UnauthorizedException("잘못된 토큰입니다!");
		}

		try {
			const secretKey =
				decodedPayload.type === "refresh"
					? envVarKeys.JWT_REFRESH_SECRET
					: envVarKeys.JWT_SECRET;

			const secret = this.configService.get<string>(secretKey);
			if (!secret) {
				throw new UnauthorizedException("JWT secret is not configured");
			}

			const payload = await this.jwtService.verifyAsync(token, {
				secret: secret,
			});

			/// payload['exp'] -> epoch time seconds
			const expiryDate = +new Date(payload.exp * 1000);
			const now = +Date.now();

			const differenceInSeconds = (expiryDate - now) / 1000;

			await this.cacheManager.set(
				tokenKey,
				payload,
				Math.max((differenceInSeconds - 30) * 1000, 1),
			);

			req.user = payload;
			this.logger.log(
				`bearer token middleware --- req.user: ${JSON.stringify(req.user)}`,
			);
			next();
		} catch (e) {
			if (e.name === "TokenExpiredError") {
				throw new UnauthorizedException("토큰이 만료됐습니다.");
			}
			this.logger.error(`bearer token middleware error: ${e.message}`);
			throw new UnauthorizedException("잘못된 토큰입니다.");
		}
	}

	validateBearerToken(rawToken: string) {
		const basicSplit = rawToken.split(" ");

		if (basicSplit.length !== 2) {
			throw new BadRequestException("토큰 포맷이 잘못됐습니다!");
		}

		const [bearer, token] = basicSplit;

		if (bearer.toLowerCase() !== "bearer") {
			throw new BadRequestException("토큰 포맷이 잘못됐습니다!");
		}

		return token;
	}
}
