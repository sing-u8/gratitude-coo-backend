import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GratitudeService } from './gratitude.service';
import { CreateGratitudeDto } from './dto/create-gratitude.dto';
import { UpdateGratitudeDto } from './dto/update-gratitude.dto';

@Controller('gratitude')
export class GratitudeController {
  constructor(private readonly gratitudeService: GratitudeService) {}

  // @Post()
  // createGratitude(@Body() createGratitudeDto: CreateGratitudeDto) {
  //   return this.gratitudeService.createGratitude(createGratitudeDto);
  // }

  // @Get()
  // getGratitudeList() {
  //   return this.gratitudeService.getGratitudeList();
  // }

  // @Get(':id')
  // searchGratitude(@Param('id') id: string) {
  //   return this.gratitudeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateGratitudeDto: UpdateGratitudeDto) {
  //   return this.gratitudeService.update(+id, updateGratitudeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.gratitudeService.remove(+id);
  // }
}
