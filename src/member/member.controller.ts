import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberService } from './member.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SearchMemberDto, SearchMemberResponseDto } from './dto/search-member.dto';
import { Public } from './auth/decorator/public.decorator';

@Controller('member')
@ApiBearerAuth()
@ApiTags('Member')
@UseInterceptors(ClassSerializerInterceptor)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Get("all")
  findAll() {
    return this.memberService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.memberService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.memberService.remove(id);
  }

  @Get()
  @Public()
  searchMember(@Query() searchMemberDto: SearchMemberDto): Promise<SearchMemberResponseDto> {
    return this.memberService.searchMember(searchMemberDto);
  }
}
