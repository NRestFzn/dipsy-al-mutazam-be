import { Request } from 'express'
import { ResidentDetailQueryFilterDto, ResidentQueryFilterDto } from '../dto'
import { FindOptions, WhereOptions, Op } from 'sequelize'
import { BaseQueryRequest } from '@/routes/version1/request/_baseQueryRequest'

export class ResidentQueryRepository extends BaseQueryRequest {
  public fullname?: string

  constructor(req: Request) {
    super(req)

    const query = req.query as unknown as ResidentQueryFilterDto

    this.fullname = query.fullname
  }

  public queryFilter(): FindOptions {
    const whereCondition: WhereOptions<ResidentQueryFilterDto>[] = []
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

export class ResidentDetailQueryRepository extends BaseQueryRequest {
  public RukunWargaId?: string
  public RukunTetanggaId?: string
  public nik?: string

  constructor(req: Request) {
    super(req)

    const query = req.query as unknown as ResidentDetailQueryFilterDto

    this.RukunWargaId = query.RukunWargaId
    this.RukunTetanggaId = query.RukunTetanggaId
    this.nik = query.nik
  }

  public queryFilter(): FindOptions {
    const whereCondition: WhereOptions<
      ResidentDetailQueryFilterDto & { nik: string }
    >[] = []

    if (this.RukunWargaId) {
      whereCondition.push({
        RukunWargaId: this.RukunWargaId,
      })
    }

    if (this.RukunTetanggaId) {
      whereCondition.push({
        RukunTetanggaId: this.RukunTetanggaId,
      })
    }

    if (this.nik) {
      whereCondition.push({
        nik: this.nik,
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
