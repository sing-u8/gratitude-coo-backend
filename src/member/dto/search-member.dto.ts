import { CursorPaginationDto } from "@/common/dto/cursor-pagination.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsOptional } from "class-validator";
import { Member } from "../entity/member.entity";

export class SearchMemberDto extends CursorPaginationDto {

  @ApiPropertyOptional({
    description: '유저의 닉네임 또는 이름',
    example: 'Brandnew',
  })
  @IsString()
  @IsOptional()
  search?: string;

}

export class SearchMemberResponseDto {
  constructor(
    members: Member[],
    nextCursor: string,
    count: number,
  ) {
    this.members = members;
    this.nextCursor = nextCursor;
    this.count = count;
  }

  @ApiProperty({
    description: '유저 목록',
    type: [Member],
  })
  @IsArray()
  @IsNotEmpty()
  members: Member[];

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
