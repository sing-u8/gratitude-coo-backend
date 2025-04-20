import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Put,
	Query,
	UseInterceptors,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "./auth/decorator/public.decorator";
import { CreateMemberDto } from "./dto/create-member.dto";
import {
	SearchMemberDto,
	SearchMemberResponseDto,
} from "./dto/search-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { MemberService } from "./member.service";

@Controller("member")
@ApiBearerAuth()
@ApiTags("Member")
@UseInterceptors(ClassSerializerInterceptor)
export class MemberController {
	constructor(private readonly memberService: MemberService) {}

	@Post()
	create(@Body() createMemberDto: CreateMemberDto) {
		return this.memberService.create(createMemberDto);
	}

	@Get("all")
	@Public()
	findAll() {
		return this.memberService.findAll();
	}

	@Get(":id")
	@Public()
	findOne(@Param("id", ParseIntPipe) id: number) {
		return this.memberService.findOne(id);
	}

	@Put(":id")
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() updateMemberDto: UpdateMemberDto,
	) {
		return this.memberService.update(id, updateMemberDto);
	}

	@Delete(":id")
	remove(@Param("id", ParseIntPipe) id: number) {
		return this.memberService.remove(id);
	}

	@Get()
	@Public()
	searchMember(
		@Query() searchMemberDto: SearchMemberDto,
	): Promise<SearchMemberResponseDto> {
		return this.memberService.searchMember(searchMemberDto);
	}
}
