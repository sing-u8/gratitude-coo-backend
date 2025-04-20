import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	ClassSerializerInterceptor,
	UseInterceptors,
	Put,
	Request,
	ParseIntPipe,
	Query,
} from "@nestjs/common";
import { GratitudeService } from "./gratitude.service";
import { CreateGratitudeDto } from "./dto/create-gratitude.dto";
import { UpdateGratitudeDto } from "./dto/update-gratitude.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
// import { TransactionInterceptor } from '@/common/interceptor/transaction.interceptor';
// import { QueryRunner } from '@/common/decorator/query-runner.decorator';
// import { QueryRunner as QueryRunnerType } from 'typeorm';
import { GetGratitudeDto } from "./dto/get-gratitude.dto";
import { UserId } from "@/member/decorator/user-id.decorator";

@Controller("gratitude")
@ApiBearerAuth()
@ApiTags("Gratitude")
@UseInterceptors(ClassSerializerInterceptor)
export class GratitudeController {
	constructor(private readonly gratitudeService: GratitudeService) {}

	@Post()
	// @UseInterceptors(TransactionInterceptor)
	createGratitude(
		@Body() createGratitudeDto: CreateGratitudeDto,
		// @QueryRunner() queryRunner: QueryRunnerType
	) {
		return this.gratitudeService.createGratitude(createGratitudeDto);
	}

	@Put(":id")
	updateGratitude(
		@Param("id", ParseIntPipe) id: number,
		@Body() updateGratitudeDto: UpdateGratitudeDto,
	) {
		return this.gratitudeService.updateGratitude(id, updateGratitudeDto);
	}

	@Delete(":id")
	deleteGratitude(@Param("id", ParseIntPipe) id: number) {
		return this.gratitudeService.deleteGratitude(id);
	}

	@Get()
	getGratitudeList(@Query() getGratitudeDto: GetGratitudeDto) {
		return this.gratitudeService.getGratitudeList(getGratitudeDto);
	}

	@Post(":id/like")
	createGratitudeLike(
		@Param("id", ParseIntPipe) id: number,
		@UserId() userId: number,
	) {
		return this.gratitudeService.toggleGratitudeLike(id, userId);
	}

	@Get(":id/like/count")
	getGratitudeLikeCount(@Param("id", ParseIntPipe) id: number) {
		return this.gratitudeService.getGratitudeLikeCount(id);
	}
}
