import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Post,
	Request,
	UseInterceptors,
} from "@nestjs/common";
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { Authorization } from "./decorator/authorization.decorator";
import { Public } from "./decorator/public.decorator";

// todo: Basic Auth에서 다른 방식으로 구현해보기 --> 최종 목표 mtls, 소셜 로그인
@Controller("auth")
@ApiTags("auth")
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@ApiBasicAuth()
	@Post("register")
	registerUser(@Authorization() token: string) {
		return this.authService.register(token);
	}

	@Public()
	@ApiBasicAuth()
	@Post("login")
	loginUser(@Authorization() token: string) {
		return this.authService.login(token);
	}

	@Post("token/block")
	blockToken(@Body("token") token: string) {
		return this.authService.tokenBlock(token);
	}

	@Post("token/access")
	async rotateAccessToken(@Request() req) {
		return {
			accessToken: await this.authService.issueToken(req.user, false),
		};
	}
}
