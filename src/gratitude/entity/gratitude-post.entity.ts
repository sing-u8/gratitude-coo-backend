import { BaseEntity } from "@common/entity/base.entity";
import { Member } from "@member/entity/member.entity";
import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { GratitudeLike } from "./gratitude-like.entity";
import { GratitudeComment } from "./gratitude-comment.entity";

export enum Visibility {
	PRIVATE = "isPrivate",
	PUBLIC = "isPublic",
}

@Entity()
export class GratitudePost extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => Member)
	recipient!: Member;

	@ManyToOne(() => Member)
	author!: Member;

	@Column({ length: 1000 })
	contents!: string;

	@Column()
	createdDate!: Date;

	@Column({ default: false })
	isAnonymous!: boolean;

	@Column({
		type: "enum",
		enum: Visibility,
		default: Visibility.PUBLIC,
	})
	visibility!: Visibility;

	@OneToMany(
		() => GratitudeLike,
		(like) => like.gratitudePost,
	)
	likes!: GratitudeLike[];

	@OneToMany(
		() => GratitudeComment,
		(gratitudeComment) => gratitudeComment.gratitudePost,
	)
	comments!: GratitudeComment[];
}
