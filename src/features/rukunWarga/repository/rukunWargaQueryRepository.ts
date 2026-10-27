import { Request } from 'express'
import { RukunWargaQueryFilterDto } from '../dto'
import { FindOptions, WhereOptions, Op } from 'sequelize'
import { BaseQueryRequest } from '@/routes/version1/request/_baseQueryRequest'

export class RukunWargaQueryRepository extends BaseQueryRequest {
  public name?: number

  constructor(req: Request) {
    super(req)

    const query = req.query as unknown as RukunWargaQueryFilterDto

    this.name = query.name
  }

  public queryFilter(): FindOptions {
    const whereCondition: WhereOptions<RukunWargaQueryFilterDto>[] = []

    if (this.name) {
      whereCondition.push({
        name: this.name,
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
