import { Request } from 'express'
import { FindOptions } from 'sequelize'
import { BaseQueryRequest } from '@/routes/version1/request/_baseQueryRequest'
import { OdgjResidentQueryFilterDto } from '../dto'

export class OdgjResidentQueryRepository extends BaseQueryRequest {
  public fullname?: string
  public startDate?: string
  public endDate?: string

  constructor(req: Request) {
    super(req)

    const query = req.query as unknown as OdgjResidentQueryFilterDto

    this.fullname = query.fullname
    this.startDate = query.startDate
    this.endDate = query.endDate
  }

  public queryFilter(): FindOptions {
    return {
      limit: this.limit,
      offset: this.offset,
      order: this.order,
    }
  }
}
