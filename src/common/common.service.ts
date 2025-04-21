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

			/**
			 * {
			 *  values : {
			 *      id: 27
			 *  },
			 *  order: ['id_DESC']
			 * }
			 */
			const cursorObj = JSON.parse(decodedCursor);

			order = cursorObj.order as string[];

			const { values } = cursorObj;

			// // 날짜 필드를 Date 객체로 변환
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

			/// WHERE (column1 > value1)
			/// OR      (column1 = value1 AND column2 < value2)
			/// OR      (column1 = value1 AND column2 = value2 AND column3 > value3)

			const columns = Object.keys(processedValues);

			if (columns.length > 0) {
				const comparisonOperator = order.some((o) => o.endsWith("DESC"))
					? "<"
					: ">";

				// 여러 정렬 필드에 대한 커서 조건 생성
				const whereClauses: string[] = [];

				// 첫 번째 정렬 필드에 대한 조건
				const firstColumn = columns[0];
				const firstCondition = `${qb.alias}.${firstColumn} ${comparisonOperator} :cursor_${firstColumn}`;
				whereClauses.push(`(${firstCondition})`);

				// 복합 정렬 필드에 대한 조건 (예: 첫 번째는 같고 두 번째는 큰/작은)
				for (let i = 1; i < columns.length; i++) {
					const prevColumns = columns.slice(0, i);
					const currColumn = columns[i];

					// 이전 컬럼들은 모두 같다는 조건
					const equalityParts = prevColumns
						.map((col: string) => `${qb.alias}.${col} = :cursor_${col}`)
						.join(" AND ");

					// 현재 컬럼은 비교 연산자 사용
					const columnOp = order[i].endsWith("DESC") ? "<" : ">";
					const comparisonPart = `${qb.alias}.${currColumn} ${columnOp} :cursor_${currColumn}`;

					whereClauses.push(`(${equalityParts} AND ${comparisonPart})`);
				}

				// 파라미터 바인딩을 위한 객체 생성
				const cursorParams: Record<string, unknown> = {};
				for (const col of columns) {
					cursorParams[`cursor_${col}`] = processedValues[col];
				}

				// 기존 WHERE 조건을 덮어쓰지 않고 AND로 추가
				qb.andWhere(`(${whereClauses.join(" OR ")})`, cursorParams);

				this.logger.log(
					`Applied cursor condition: (${whereClauses.join(" OR ")})`,
				);
				this.logger.log(`Cursor parameters: ${JSON.stringify(cursorParams)}`);
			}
		}

		// ["likeCount_DESC", "id_DESC"]
		for (let i = 0; i < order.length; i++) {
			const [column, direction] = order[i].split("_");

			if (direction !== "ASC" && direction !== "DESC") {
				throw new BadRequestException(
					"Order는 ASC 또는 DESC으로 입력해주세요!",
				);
			}

			if (i === 0) {
				qb.orderBy(`${qb.alias}.${column}`, direction as "ASC" | "DESC");
			} else {
				qb.addOrderBy(`${qb.alias}.${column}`, direction as "ASC" | "DESC");
			}
		}

		qb.take(take);

		const results = await qb.getMany();

		// 결과가 take보다 적으면 더 이상 페이지가 없으므로 빈 커서를 반환
		const nextCursor =
			results.length < take ? "" : this.generateNextCursor(results, order);

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
