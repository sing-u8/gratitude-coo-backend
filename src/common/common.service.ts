import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';
import { ObjectLiteral } from 'typeorm';

@Injectable()
export class CommonService {

  // todo: 로직 나중에 다시 이해하고 리팩토링하기 --> 좀 더 유연하게 만들기
  async applyCursorPaginationParamsToQb<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    dto: CursorPaginationDto,
  ) {
    let { cursor, take, order } = dto;
    if (typeof dto.order === 'string') {
      order = [dto.order];
    }

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');

      const cursorObj = JSON.parse(decodedCursor);

      order = cursorObj.order;

      const { values } = cursorObj;

      /// WHERE (column1 > value1)
      /// OR      (column1 = value1 AND column2 < value2)
      /// OR      (column1 = value1 AND column2 = value2 AND column3 > value3)
      /// (movie.column1, movie.column2, movie.column3) > (:value1, :value2, :value3)

      const columns = Object.keys(values);
      const comparisonOperator = order.some((o) => o.endsWith('DESC'))
        ? '<'
        : '>';
      const whereConditions = columns.map((c) => `${qb.alias}.${c}`).join(',');
      const whereParams = columns.map((c) => `:${c}`).join(',');

      qb.where(
        `(${whereConditions}) ${comparisonOperator} (${whereParams})`,
        values,
      );
    }

    for (let i = 0; i < order.length; i++) {
      const [column, direction] = order[i].split('_');

      if (direction !== 'ASC' && direction !== 'DESC') {
        throw new BadRequestException(
          'Order는 ASC 또는 DESC으로 입력해주세요!',
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
      const [column] = columnOrder.split('_');
      values[column] = lastItem?.[column] ?? "";
    }

    const cursorObj = { values, order };
    const nextCursor = Buffer.from(JSON.stringify(cursorObj)).toString(
      'base64',
    );

    return nextCursor;
  }
}
