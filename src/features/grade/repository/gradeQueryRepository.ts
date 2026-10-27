import { Request } from 'express'
import { GradeQueryFilterDto } from '../dto'
import { FindOptions, WhereOptions, Op } from 'sequelize'
import { BaseQueryRequest } from '@/routes/version1/request/_baseQueryRequest'

export class GradeQueryRepository extends BaseQueryRequest {
  public name?: string
  public level?: string

  constructor(req: Request) {
    super(req)

    const query = req.query as unknown as GradeQueryFilterDto

    this.name = query.name
    this.level = query.level
  }

  public queryFilter(): FindOptions {
    const whereCondition: WhereOptions<GradeQueryFilterDto>[] = []
    if (this.name) {
      whereCondition.push({
        name: {
          [Op.like]: `%${this.name}%`,
        },
      })
    }

    if (this.level) {
      whereCondition.push({
        level: this.level,
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
