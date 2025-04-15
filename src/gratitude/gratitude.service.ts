import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGratitudeDto } from './dto/create-gratitude.dto';
import { UpdateGratitudeDto } from './dto/update-gratitude.dto';
import { GratitudePost } from './entity/gratitude-post.entity';
import { GratitudeLike } from './entity/gratitude-like.entity';
import { Member } from '@/member/entity/member.entity';

@Injectable()
export class GratitudeService {

  constructor(
    @InjectRepository(GratitudeLike)
    private gratitudeLikeRepository: Repository<GratitudeLike>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    @InjectRepository(GratitudePost)
    private gratitudePostRepository: Repository<GratitudePost>,
    private configService: ConfigService,
    
  ) {}

  // createGratitude(createGratitudeDto: CreateGratitudeDto) {
  //   return 'This action adds a new gratitude';
  // }

  // getGratitudeList() {
  //   return `This action returns all gratitude`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} gratitude`;
  // }

  // update(id: number, updateGratitudeDto: UpdateGratitudeDto) {
  //   return `This action updates a #${id} gratitude`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} gratitude`;
  // }
}
