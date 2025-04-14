import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@common/entity/base.entity';
import { Member } from '@member/entity/member.entity';
import { GratitudePost } from '@gratitude/entity/gratitude-post.entity';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Member)
  author!: Member;

  @ManyToOne(() => GratitudePost)
  gratitudePost!: GratitudePost;

  @Column({ length: 1000 })
  content!: string;
} 