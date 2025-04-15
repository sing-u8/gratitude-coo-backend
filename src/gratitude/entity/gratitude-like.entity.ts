import { BaseEntity } from "@common/entity/base.entity";
import { Member } from "@member/entity/member.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GratitudePost } from "./gratitude-post.entity";

@Entity()
export class GratitudeLike extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(
		() => Member,
		(member) => member.likes,
	)
	member!: Member;

	@ManyToOne(
		() => GratitudePost,
		(gratitudePost) => gratitudePost.likes,
	)
	gratitudePost!: GratitudePost;
}
