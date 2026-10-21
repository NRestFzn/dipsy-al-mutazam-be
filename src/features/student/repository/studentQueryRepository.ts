import { Request } from 'express'
import { StudentDetailQueryFilterDto, StudentQueryFilterDto } from '../dto'
import { FindOptions, WhereOptions, Op } from 'sequelize'
import { BaseQueryRequest } from '@/routes/version1/request/_baseQueryRequest'

export class StudentQueryRepository extends BaseQueryRequest {
  public fullname?: string

  constructor(req: Request) {
    super(req)

    const query = req.query as unknown as StudentQueryFilterDto

    this.fullname = query.fullname
  }

  public queryFilter(): FindOptions {
    const whereCondition: WhereOptions<StudentQueryFilterDto>[] = []
    if (this.fullname) {
      whereCondition.push({
        fullname: {
          [Op.like]: `%${this.fullname}%`,
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

export class StudentDetailQueryFilterRepository extends BaseQueryRequest {
  public GradeId?: string
  public ClassId?: string
  public nisn?: string

  constructor(req: Request) {
    super(req)

    const query = req.query as any

    this.GradeId = query.GradeId || query.TingkatId
    this.ClassId = query.ClassId || query.KelasId
    this.nisn = query.nisn
  }

  public queryFilter(): FindOptions {
    const whereCondition: WhereOptions<any>[] = []

    if (this.GradeId) {
      whereCondition.push({
        GradeId: this.GradeId,
      })
    }

    if (this.ClassId) {
      whereCondition.push({
        ClassId: this.ClassId,
      })
    }

    if (this.nisn) {
      whereCondition.push({
        nisn: this.nisn,
      })
    }

    const findCondition = {
      where: {
        [Op.and]: whereCondition,
      },
    }

    return findCondition
  }
}
