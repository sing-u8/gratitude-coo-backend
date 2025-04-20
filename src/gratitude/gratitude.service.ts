import { CommonService } from "@/common/common.service";
import { Member } from "@/member/entity/member.entity";
import {
	Inject,
	Injectable,
	LoggerService,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { Repository } from "typeorm";
import { CreateGratitudeDto } from "./dto/create-gratitude.dto";
import {
	GetGratitudeDto,
	GetGratitudeResponseDto,
	PostType,
} from "./dto/get-gratitude.dto";
import { UpdateGratitudeDto } from "./dto/update-gratitude.dto";
import { GratitudeLike } from "./entity/gratitude-like.entity";
import { GratitudePost } from "./entity/gratitude-post.entity";

@Injectable()
export class GratitudeService {
	constructor(
		@InjectRepository(GratitudeLike)
		private gratitudeLikeRepository: Repository<GratitudeLike>,
		@InjectRepository(Member)
		private memberRepository: Repository<Member>,
		@InjectRepository(GratitudePost)
		private gratitudePostRepository: Repository<GratitudePost>,
		private commonService: CommonService,
		@Inject(WINSTON_MODULE_NEST_PROVIDER)
		private readonly logger: LoggerService,
	) {}

	async createGratitude(createGratitudeDto: CreateGratitudeDto) {
		const { contents, recipientId, authorId, isAnonymous, visibility } =
			createGratitudeDto;

		const recipient = await this.memberRepository.findOne({
			where: { id: recipientId },
		});
		if (!recipient) {
			throw new NotFoundException("Recipient not found");
		}

		const author = await this.memberRepository.findOne({
			where: { id: authorId },
		});
		if (!author) {
			throw new NotFoundException("Author not found");
		}

		const gratitudePost = this.gratitudePostRepository.create({
			contents: contents,
			recipient: recipient,
			author: author,
			isAnonymous: isAnonymous,
			visibility: visibility,
		});

		return await this.gratitudePostRepository.save(gratitudePost);
	}

	async updateGratitude(id: number, updateGratitudeDto: UpdateGratitudeDto) {
		const gratitudePost = await this.gratitudePostRepository.findOne({
			where: { id },
		});
		if (!gratitudePost) {
			throw new NotFoundException("Gratitude post not found");
		}

		await this.gratitudePostRepository.update(id, updateGratitudeDto);

		return this.gratitudePostRepository.findOne({
			where: { id },
		});
	}

	async deleteGratitude(id: number) {
		const gratitudePost = await this.gratitudePostRepository.findOne({
			where: { id },
		});
		if (!gratitudePost) {
			throw new NotFoundException("Gratitude post not found");
		}

		await this.gratitudePostRepository.delete(id);

		return id;
	}

	async getGratitudeList(getGratitudeDto: GetGratitudeDto) {
		const { memberId, postType } = getGratitudeDto;

		this.logger.log(`getGratitudeList -- ${JSON.stringify(getGratitudeDto)}`);

		const queryBuilder = this.gratitudePostRepository
			.createQueryBuilder("gratitudePost")
			.leftJoinAndSelect("gratitudePost.recipient", "recipient")
			.leftJoinAndSelect("gratitudePost.author", "author");

		if (postType === PostType.FromMe) {
			queryBuilder
				.where("gratitudePost.recipientId = :recipientId", {
					recipientId: memberId,
				})
				.andWhere("gratitudePost.authorId = :authorId", { authorId: memberId });
		} else if (postType === PostType.FromOther) {
			queryBuilder
				.where("gratitudePost.recipientId = :recipientId", {
					recipientId: memberId,
				})
				.andWhere("gratitudePost.authorId != :authorId", {
					authorId: memberId,
				});
		} else if (postType === PostType.ToOther) {
			queryBuilder
				.where("gratitudePost.recipientId != :recipientId", {
					recipientId: memberId,
				})
				.andWhere("gratitudePost.authorId = :authorId", { authorId: memberId });
		}

		const { nextCursor } =
			await this.commonService.applyCursorPaginationParamsToQb(
				queryBuilder,
				getGratitudeDto,
			);

		const [gratitudeList, count] = await queryBuilder.getManyAndCount();

		return new GetGratitudeResponseDto(gratitudeList, nextCursor, count);
	}

	async toggleGratitudeLike(id: number, userId: number) {
		const gratitudePost = await this.gratitudePostRepository.findOne({
			where: { id },
		});
		if (!gratitudePost) {
			throw new NotFoundException("Gratitude post not found");
		}

		const member = await this.memberRepository.findOne({
			where: { id: userId },
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}

		const likeRecord = await this.gratitudeLikeRepository
			.createQueryBuilder("like")
			.where("like.gratitudePostId = :id", { id })
			.andWhere("like.memberId = :userId", { userId })
			.getOne();

		if (likeRecord) {
			await this.gratitudeLikeRepository.delete(likeRecord.id);
			return { isLiked: false };
		}

		await this.gratitudeLikeRepository.save({
			gratitudePost,
			member,
		});
		return { isLiked: true };
	}

	async getGratitudeLikeCount(id: number) {
		const likeCount = await this.gratitudeLikeRepository.count({
			where: { gratitudePost: { id } },
		});
		return likeCount;
	}
}
