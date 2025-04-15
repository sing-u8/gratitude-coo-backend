import { IsEmail, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  nickname: string;
}
