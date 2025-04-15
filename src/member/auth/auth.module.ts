import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MemberModule } from "@member/member.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Member } from "@member/entity/member.entity";
import { JwtModule } from "@nestjs/jwt";
@Module({
	imports: [
		TypeOrmModule.forFeature([Member]),
		JwtModule.register({}),
		MemberModule,
	],
	controllers: [AuthController],
	providers: [AuthService],
	exports: [AuthService, JwtModule],
})
export class AuthModule {}
