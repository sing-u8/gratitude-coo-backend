import { GratitudeLike } from "@gratitude/entity/gratitude-like.entity";
import { GratitudePost } from "@gratitude/entity/gratitude-post.entity";
import { GratitudeComment } from "@/gratitude/entity/gratitude-comment.entity";
import { BaseEntity } from "@common/entity/base.entity";
import { Exclude } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Member extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ length: 20, unique: true })
	name!: string;

	@Column({ length: 30, unique: true })
	nickname!: string;

	@Column({ length: 100, unique: true })
	email!: string;

	@Column({ length: 255 })
	@Exclude({
		toPlainOnly: true,
	})
	password!: string;

	@Column({ length: 255, nullable: true })
	profile?: string;

	@OneToMany(() => GratitudePost, (post) => post.author)
	authoredPosts!: GratitudePost[];

	@OneToMany(() => GratitudePost, (post) => post.recipient)
	receivedPosts!: GratitudePost[];

	@OneToMany(() => GratitudeLike, (like) => like.member)
	likes!: GratitudeLike[];

	@OneToMany(() => GratitudeComment, (gratitudeComment) => gratitudeComment.author)
	comments!: GratitudeComment[];
}
