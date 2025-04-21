import { PostType } from "@gratitude/dto/get-gratitude.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber } from "class-validator";

export class GetGratitudeCountResponseDto {
	constructor(sentCount: number, receivedCount: number) {
		this.sentCount = sentCount;
		this.receivedCount = receivedCount;
	}

	@ApiProperty({
		description: "작성한 감사 메시지 수",
		example: 10,
	})
	@IsInt()
	sentCount: number;

	@ApiProperty({
		description: "전달받은 감사 메시지 수",
		example: 99,
	})
	@IsInt()
	receivedCount: number;
}
