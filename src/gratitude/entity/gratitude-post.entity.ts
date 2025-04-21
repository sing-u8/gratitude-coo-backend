import { Member } from "@member/entity/member.entity";
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { GratitudeLike } from "./gratitude-like.entity";
import { GratitudeComment } from "./gratitude-comment.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
export enum Visibility {
	PRIVATE = "isPrivate",
	PUBLIC = "isPublic",
}

@Entity()
export class GratitudePost {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Member, (member) => member.receivedPosts)
	@JoinColumn({ name: "recipientId" })
	recipient: Member;

	@ManyToOne(() => Member, (member) => member.authoredPosts)
	@JoinColumn({ name: "authorId" })
	author: Member;

	@Column({ length: 1000 })
	contents: string;

	@Column({ default: false })
	isAnonymous: boolean;

	@Column({
		type: "enum",
		enum: Visibility,
		default: Visibility.PUBLIC,
	})
	visibility: Visibility;

	@OneToMany(
		() => GratitudeLike,
		(like) => like.gratitudePost,
	)
	likes: GratitudeLike[];

	@OneToMany(
		() => GratitudeComment,
		(gratitudeComment) => gratitudeComment.gratitudePost,
	)
	comments: GratitudeComment[];

	@CreateDateColumn({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
	})
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
