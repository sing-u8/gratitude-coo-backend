import { PartialType } from "@nestjs/swagger";
import { CreateGratitudeDto } from "./create-gratitude.dto";

export class UpdateGratitudeDto extends PartialType(CreateGratitudeDto) {}
