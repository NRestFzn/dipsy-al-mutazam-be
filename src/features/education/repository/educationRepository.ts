import { Request } from 'express'
import Education from '@/database/model/education'
import { db } from '@/database/databaseConnection'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { EducationQueryRepository } from './educationQueryRepository'
import { CreateEducationDto, EducationDto, UpdateEducationDto } from '../dto'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'

export class EducationRepository {
  async getAll(req: Request): Promise<{
    data: EducationDto[]
    meta: { pagination: MetaPaginationDto }
  }> {
    const query = new EducationQueryRepository(req)

    const data = await Education.findAll({
      ...query.queryFilter(),
      order: [['order', 'asc']],
    })

    const dataCount = await Education.count()

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

  async getByPk(id: string): Promise<Education> {
    const data = await Education.findByPk(id)

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async add(formData: CreateEducationDto): Promise<EducationDto> {
    let data: any

    await db.sequelize!.transaction(async (transaction) => {
      data = await Education.create({ ...formData }, { transaction })
    })

    return data
  }

  async update(id: string, formData: UpdateEducationDto): Promise<void> {
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
