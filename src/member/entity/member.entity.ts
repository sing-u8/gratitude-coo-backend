import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@common/entity/base.entity';
import { GratitudePost } from '@gratitude/entity/gratitude-post.entity';
import { GratitudeLike } from '@gratitude/entity/gratitude-like.entity';
import { Comment } from '@comment/entity/comment.entity';

@Entity()
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 20 })
  name!: string;

  @Column({ length: 30 })
  nickname!: string;

  @Column({ length: 100 })
  email!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ length: 255, nullable: true })
  profile?: string;

  // @OneToMany(() => GratitudePost, (post) => post.author)
  // authoredPosts!: GratitudePost[];

  // @OneToMany(() => GratitudePost, (post) => post.recipient)
  // receivedPosts!: GratitudePost[];

  // @OneToMany(() => GratitudeLike, (like) => like.member)
  // likes!: GratitudeLike[];

  // @OneToMany(() => Comment, (comment) => comment.author)
  // comments!: Comment[];
} 