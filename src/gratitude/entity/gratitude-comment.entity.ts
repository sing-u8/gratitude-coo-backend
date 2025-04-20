import { BaseEntity } from "@common/entity/base.entity";
import { GratitudePost } from "@gratitude/entity/gratitude-post.entity";
import { Member } from "@member/entity/member.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class GratitudeComment extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(() => Member)
	author!: Member;

	@ManyToOne(() => GratitudePost)
	gratitudePost!: GratitudePost;

	@Column({ length: 1000 })
	content!: string;
}
