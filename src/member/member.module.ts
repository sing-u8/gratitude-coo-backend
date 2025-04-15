import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Member } from "./entity/member.entity";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";
import { CommonModule } from "@/common/common.module";

@Module({
	imports: [TypeOrmModule.forFeature([Member]), CommonModule],
	controllers: [MemberController],
	providers: [MemberService],
	exports: [MemberService],
})
export class MemberModule {}
