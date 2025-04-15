import { ApiHideProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export class BaseEntity {
	@CreateDateColumn()
	@Exclude()
	@ApiHideProperty()
	createdAt: Date;

	@UpdateDateColumn()
	@Exclude()
	@ApiHideProperty()
	updatedAt: Date;
}
