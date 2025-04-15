import { PartialType } from '@nestjs/mapped-types';
import { CreateMemberDto } from './create-member.dto';
import { IsString } from 'class-validator';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
    @IsString()
    profile?: string;
}
