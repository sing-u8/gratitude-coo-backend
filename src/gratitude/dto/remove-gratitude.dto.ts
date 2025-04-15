import { IsNotEmpty, IsNumber } from "class-validator";

export class RemoveGratitudeDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;
}