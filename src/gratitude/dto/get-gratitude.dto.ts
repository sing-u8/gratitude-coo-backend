import { CursorPaginationDto } from "@/common/dto/cursor-pagination.dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { IsNumber } from "class-validator";
import { GratitudePost } from "../entity/gratitude-post.entity";

export enum PostType {
    FromMe = "FromMe",
    FromOther = "FromOther",
    ToOther = "ToOther"
}

export class GetGratitudeDto extends CursorPaginationDto {

    @ApiProperty({
        description: '유저 Id',
        example: 1,
    })
    @IsNumber()
    memberId: number;

    @ApiProperty({
        description: '게시글 타입',
        example: PostType.FromMe,
    })
    @IsEnum(PostType)
    postType?: PostType;

}

export class GetGratitudeResponseDto {

    constructor(
        gratitudeList: GratitudePost[],
        nextCursor: string,
        count: number,
    ) {
        this.gratitudeList = gratitudeList;
        this.nextCursor = nextCursor;
        this.count = count;
    }

    @ApiProperty({
        description: '감사메시지 리스트',
        type: [GratitudePost],
    })
    @IsArray()
    @IsNotEmpty()
    gratitudeList: GratitudePost[];

    @ApiProperty({
        description: '다음 커서',
        example: '인코딩된 커서 스트링',
    })
    @IsString()
    @IsOptional()
    nextCursor?: string;
    
    @ApiProperty({
        description: '총 개수',
        example: 10,
    })
    @IsNumber()
    @IsNotEmpty()
    count: number;

}