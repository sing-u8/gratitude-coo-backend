import { ApiHideProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export class BaseEntity {
	@CreateDateColumn({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
	})
	@Exclude()
	@ApiHideProperty()
	createdAt: Date;

	@UpdateDateColumn({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
		onUpdate: "CURRENT_TIMESTAMP",
	})
	@Exclude()
	@ApiHideProperty()
	updatedAt: Date;
}
