import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsNumber } from 'class-validator';

export class CursorPaginationDto {

  // id_52,likeCount_20  //52
  @ApiPropertyOptional({
    description: '페이지네이션 커서',
    example: 'eyJ2YWx1ZXMiOnsiaWQiOjN9LCJvcmRlciI6WyJpZF9ERVNDIl19',
  })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiProperty({
    description: '내림차 또는 오름차 정렬',
    example: ['id_DESC'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  order: string[];

  @IsNumber()
  @ApiProperty({
    description: '가져올 데이터 갯수',
    example: 10,
  })
  take: number;
}
