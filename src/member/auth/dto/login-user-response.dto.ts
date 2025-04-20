import { Member } from "@/member/entity/member.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginUserResponseDto {
	constructor(accessToken: string, refreshToken: string, member: Member) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
		this.member = member;
	}

	@IsString()
	accessToken: string;
	@IsString()
	refreshToken: string;

	@ApiProperty({ example: "User", type: Member })
	@IsNotEmpty()
	member: Member;
}
