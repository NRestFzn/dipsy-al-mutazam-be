import { Request } from 'express'
import SalaryRange from '@/database/model/salaryRange'
import { db } from '@/database/databaseConnection'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { SalaryRangeQueryRepository } from './salaryRangeQueryRepository'
import {
  CreateSalaryRangeDto,
  SalaryRangeDto,
  UpdateSalaryRangeDto,
} from '../dto'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'

export class SalaryRangeRepository {
  async getAll(req: Request): Promise<{
    data: SalaryRangeDto[]
    meta: { pagination: MetaPaginationDto }
  }> {
    const query = new SalaryRangeQueryRepository(req)

    const data = await SalaryRange.findAll(query.queryFilter())

    const dataCount = await SalaryRange.count()

    return {
      data,
      meta: {
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          pageCount: data.length,
          total: dataCount,
        },
      },
    }
  }

  async getByPk(id: string): Promise<SalaryRange> {
    const data = await SalaryRange.findByPk(id)

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async add(formData: CreateSalaryRangeDto): Promise<SalaryRangeDto> {
    let data: any

    await db.sequelize!.transaction(async (transaction) => {
      data = await SalaryRange.create({ ...formData }, { transaction })
    })

    return data
  }

  async update(id: string, formData: UpdateSalaryRangeDto): Promise<void> {
    const data = await this.getByPk(id)

    await db.sequelize!.transaction(async (transaction) => {
      await data.update({ ...formData }, { transaction })
    })
  }

  async delete(id: string): Promise<void> {
    const data = await this.getByPk(id)

    await data.destroy()
  }
}
