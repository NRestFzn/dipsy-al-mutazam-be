import { Request } from 'express'
import { SalaryRangeQueryFilterDto } from '../dto'
import { FindOptions, WhereOptions, Op } from 'sequelize'
import { BaseQueryRequest } from '@/routes/version1/request/_baseQueryRequest'

export class SalaryRangeQueryRepository extends BaseQueryRequest {
  public minRange?: number
  public maxRange?: number

  constructor(req: Request) {
    super(req)

    const query = req.query as unknown as SalaryRangeQueryFilterDto

    this.minRange = query.minRange
    this.maxRange = query.maxRange
  }

  public queryFilter(): FindOptions {
    const whereCondition: WhereOptions<SalaryRangeQueryFilterDto>[] = []

    if (this.minRange) {
      whereCondition.push({
        minRange: this.minRange,
      })
    }

    if (this.maxRange) {
      whereCondition.push({
        maxRange: this.maxRange,
      })
    }

    const findCondition = {
      where: {
        [Op.and]: whereCondition,
      },
      limit: this.limit,
      offset: this.offset,
      order: this.order,
    }

    return findCondition
  }
}
