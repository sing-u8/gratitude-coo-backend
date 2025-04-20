import {
	BadRequestException,
	Inject,
	Injectable,
	LoggerService,
} from "@nestjs/common";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import { SelectQueryBuilder } from "typeorm";
import { ObjectLiteral } from "typeorm";
import { CursorPaginationDto } from "./dto/cursor-pagination.dto";

@Injectable()
export class CommonService {
	constructor(
		@Inject(WINSTON_MODULE_NEST_PROVIDER)
		private readonly logger: LoggerService,
	) {}

	// todo: 로직 나중에 다시 이해하고 리팩토링하기 --> 좀 더 유연하게 만들기
	async applyCursorPaginationParamsToQb<T extends ObjectLiteral>(
		qb: SelectQueryBuilder<T>,
		dto: CursorPaginationDto,
	) {
		let { cursor, take, order } = dto;
		if (typeof dto.order === "string") {
			order = [dto.order];
		}

		if (cursor) {
			const decodedCursor = Buffer.from(cursor, "base64").toString("utf-8");

			const cursorObj = JSON.parse(decodedCursor);

			order = cursorObj.order as string[];

			const { values } = cursorObj;

			// 날짜 필드를 Date 객체로 변환
			const processedValues = { ...values };
			if (
				processedValues.createdAt &&
				typeof processedValues.createdAt === "string"
			) {
				processedValues.createdAt = new Date(processedValues.createdAt);
			}
			if (
				processedValues.updatedAt &&
				typeof processedValues.updatedAt === "string"
			) {
				processedValues.updatedAt = new Date(processedValues.updatedAt);
			}

			// Build a more flexible WHERE clause for cursor pagination
			// For multiple ordering fields:
			// (first_field > value1) OR
			// (first_field = value1 AND second_field > value2) OR
			// (first_field = value1 AND second_field = value2 AND third_field > value3)
			// and so on...

			const columns = Object.keys(values);

			if (columns.length > 0) {
				const whereClauses: Array<string> = [];

				// Build the WHERE clause for each level of ordering
				for (let i = 0; i < columns.length; i++) {
					const currentFields = columns.slice(0, i + 1);
					const lastField = currentFields[currentFields.length - 1];

					// Determine the comparison operator for the last field
					const [, lastFieldDirection] = order[i].split("_");
					const comparisonOperator = lastFieldDirection === "DESC" ? "<" : ">";

					// Build equality conditions for all fields except the last one
					const equalityConditions = currentFields
						.slice(0, -1)
						.map((field) => `${qb.alias}.${field} = :${field}`);

					// Comparison condition for the last field
					const comparisonCondition = `${qb.alias}.${lastField} ${comparisonOperator} :${lastField}`;

					// Combine conditions
					let whereClause = comparisonCondition;
					if (equalityConditions.length > 0) {
						whereClause = `${equalityConditions.join(" AND ")} AND ${comparisonCondition}`;
					}

					whereClauses.push(`(${whereClause})`);
				}

				// Combine all level clauses with OR
				qb.where(whereClauses.join(" OR "), processedValues);
			}
		}

		for (let i = 0; i < order.length; i++) {
			const [column, direction] = order[i].split("_");

			if (direction !== "ASC" && direction !== "DESC") {
				throw new BadRequestException(
					"Order는 ASC 또는 DESC으로 입력해주세요!",
				);
			}

			if (i === 0) {
				qb.orderBy(`${qb.alias}.${column}`, direction);
			} else {
				qb.addOrderBy(`${qb.alias}.${column}`, direction);
			}
		}

		qb.take(take);

		const results = await qb.getMany();

		const nextCursor = this.generateNextCursor(results, order);

		return { qb, nextCursor };
	}

	generateNextCursor<T>(results: T[], order: string[]): string {
		if (results.length === 0) return "";

		const lastItem = results[results.length - 1];

		const values = {};
		for (const columnOrder of order) {
			const [column] = columnOrder.split("_");
			values[column] = lastItem[column];
		}

		const cursorObj = { values, order };
		const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString(
			"base64",
		);

		return nextCursor;
	}
}
