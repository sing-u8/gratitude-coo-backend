import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModule } from '@member/member.module';
import { GratitudeService } from './gratitude.service';
import { GratitudeController } from './gratitude.controller';
import { GratitudePost } from './entity/gratitude-post.entity';
import { GratitudeLike } from './entity/gratitude-like.entity';
import { GratitudeComment } from './entity/gratitude-comment.entity';
import { Member } from '@/member/entity/member.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([GratitudePost, GratitudeLike, GratitudeComment, Member]),
    MemberModule,
  ],
  controllers: [GratitudeController],
  providers: [GratitudeService],
})
export class GratitudeModule {}
