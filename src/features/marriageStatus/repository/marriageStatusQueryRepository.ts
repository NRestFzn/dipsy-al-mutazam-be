import { Request } from 'express'
import { MarriageStatusQueryFilterDto } from '../dto'
import { FindOptions, WhereOptions, Op } from 'sequelize'
import { BaseQueryRequest } from '@/routes/version1/request/_baseQueryRequest'

export class MarriageStatusQueryRepository extends BaseQueryRequest {
  public name?: string

  constructor(req: Request) {
    super(req)

    const query = req.query as unknown as MarriageStatusQueryFilterDto

    this.name = query.name
  }

  public queryFilter(): FindOptions {
    const whereCondition: WhereOptions<MarriageStatusQueryFilterDto>[] = []

    if (this.name) {
      whereCondition.push({
        name: {
          [Op.like]: `%${this.name}%`,
        },
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
