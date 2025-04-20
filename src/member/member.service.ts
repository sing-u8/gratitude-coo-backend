import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { NotFoundError } from "rxjs";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { envVarKeys } from "@common/const/env.const";

import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { Member } from "./entity/member.entity";
import {
	SearchMemberDto,
	SearchMemberResponseDto,
} from "./dto/search-member.dto";
import { CommonService } from "@/common/common.service";

@Injectable()
export class MemberService {
	constructor(
		@InjectRepository(Member)
		private memberRepository: Repository<Member>,
		private configService: ConfigService,
		private commonService: CommonService,
	) {}

	async create(createMemberDto: CreateMemberDto) {
		const { name, nickname, email, password } = createMemberDto;

		const existingMember = await this.memberRepository.findOne({
			where: {
				email,
			},
		});

		if (existingMember)
			throw new BadRequestException("이미 존재하는 이메일입니다.");

		const hashedPassword = await bcrypt.hash(
			password,
			this.configService.get<number>(envVarKeys.HASH_ROUNDS) ?? 10,
		);

		const member = this.memberRepository.create({
			name,
			nickname,
			email,
			password: hashedPassword,
		});

		await this.memberRepository.save(member);

		return this.memberRepository.findOne({
			where: {
				email,
			},
		});
	}

	findAll() {
		return this.memberRepository.find();
	}

	async findOne(id: number) {
		const member = await this.memberRepository.findOne({
			where: {
				id,
			},
		});

		if (!member) throw new NotFoundException("존재하지 않는 회원입니다.");

		return member;
	}

	async update(id: number, updateMemberDto: UpdateMemberDto) {
		const member = await this.memberRepository.findOne({
			where: {
				id,
			},
		});

		if (!member) throw new NotFoundException("존재하지 않는 회원입니다.");

		const updateData = Object.assign({}, updateMemberDto);

		if (updateMemberDto.password) {
			updateData.password = await bcrypt.hash(
				updateMemberDto.password,
				this.configService.get<number>(envVarKeys.HASH_ROUNDS) ?? 10,
			);
		}

		await this.memberRepository.update(
			{
				id,
			},
			updateData,
		);

		return this.memberRepository.findOne({
			where: {
				id,
			},
		});
	}

	async remove(id: number) {
		const member = await this.memberRepository.findOne({
			where: {
				id,
			},
		});

		if (!member) throw new NotFoundException("존재하지 않는 회원입니다.");

		await this.memberRepository.delete(id);

		return id;
	}

	// 유저에 따라 검색할 수 있는 메시지가 달라짐 --> 나중에 추가로 구현하기
	async searchMember(searchMemberDto: SearchMemberDto) {
		const { search } = searchMemberDto;

		const queryBuilder = this.memberRepository.createQueryBuilder("member");

		if (search) {
			queryBuilder
				.where("member.nickname LIKE :search", { search: `%${search}%` })
				.orWhere("member.name LIKE :search", { search: `%${search}%` });
		}

		const { nextCursor } =
			await this.commonService.applyCursorPaginationParamsToQb(
				queryBuilder,
				searchMemberDto,
			);

		const [members, count] = await queryBuilder.getManyAndCount();

		return new SearchMemberResponseDto(members, nextCursor, count);
	}
}
