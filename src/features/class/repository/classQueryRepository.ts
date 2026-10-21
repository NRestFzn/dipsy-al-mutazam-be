import { Request } from 'express'
import { ClassQueryFilterDto } from '../dto'
import { FindOptions, WhereOptions, Op } from 'sequelize'
import { BaseQueryRequest } from '@/routes/version1/request/_baseQueryRequest'

export class ClassQueryRepository extends BaseQueryRequest {
  public name?: string
  public GradeId?: string

  constructor(req: Request) {
    super(req)

    const query = req.query as unknown as ClassQueryFilterDto

    this.name = query.name
    this.GradeId = query.GradeId
  }

  public queryFilter(): FindOptions {
    const whereCondition: WhereOptions<ClassQueryFilterDto>[] = []

    if (this.name) {
      whereCondition.push({
        name: {
          [Op.like]: `%${this.name}%`,
        },
      })
    }

    if (this.GradeId) {
      whereCondition.push({
        GradeId: this.GradeId,
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

// Backwards compatibility alias
export const RukunTetanggaQueryRepository = ClassQueryRepository
