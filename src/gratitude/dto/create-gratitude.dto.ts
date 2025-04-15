import { IsNotEmpty, IsString, IsBoolean, IsEnum, IsNumber } from "class-validator";
import { Visibility } from "../entity/gratitude-post.entity";

export class CreateGratitudeDto {

    @IsNumber()
    @IsNotEmpty()
    recipientId: number;

    @IsNumber()
    @IsNotEmpty()
    authorId: number;

    @IsString()
    @IsNotEmpty()
    contents: string;

    @IsBoolean()
    @IsNotEmpty()
    isAnonymous: boolean;

    @IsEnum(Visibility)
    @IsNotEmpty()
    visibility: Visibility;
    
}
