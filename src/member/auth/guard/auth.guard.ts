import { CanActivate, ExecutionContext, Inject, Injectable, LoggerService, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Public } from "../decorator/public.decorator";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		@Inject(WINSTON_MODULE_NEST_PROVIDER)
		private readonly logger: LoggerService,
	) {}

	canActivate(context: ExecutionContext): boolean {
		const isPublic = this.reflector.get(Public, context.getHandler());
		if (isPublic) return true;

		const request = context.switchToHttp().getRequest();
		this.logger.log('auth guard:', request);

		if (!request.user) {
			throw new UnauthorizedException('인증이 필요합니다.');
		}

		if (request.user.type !== 'access') {
			throw new UnauthorizedException('잘못된 토큰 타입입니다.');
		}

		return true;
	}
}
