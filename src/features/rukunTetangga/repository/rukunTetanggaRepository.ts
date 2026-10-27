import { Request } from 'express'
import RukunTetangga from '@/database/model/rukunTetangga'
import { db } from '@/database/databaseConnection'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { RukunTetanggaQueryRepository } from './rukunTetanggaQueryRepository'
import {
  CreateRukunTetanggaDto,
  RukunTetanggaDetailDto,
  RukunTetanggaDto,
  UpdateRukunTetanggaDto,
} from '../dto'
import { RukunWargaRepository } from '@/features/rukunWarga/repository/rukunWargaRepository'
import User from '@/database/model/user'
import UserDetail from '@/database/model/userDetail'
import { Sequelize } from 'sequelize-typescript'
import RukunWarga from '@/database/model/rukunWarga'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'

const rukunWargaRepository = new RukunWargaRepository()

export class RukunTetanggaRepository {
  async getAll(req: Request): Promise<{
    data: RukunTetanggaDto[]
    meta: { pagination: MetaPaginationDto }
  }> {
    const query = new RukunTetanggaQueryRepository(req)

    const data = await RukunTetangga.findAll({
      ...query.queryFilter(),
      include: [{ model: RukunWarga }],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
                      SELECT COUNT(*)
                      FROM user_details AS ud
                      WHERE ud.RukunTetanggaId = RukunTetangga.id
                    )`),
            'userCount',
          ],
        ],
      },
    })

    const dataCount = await RukunTetangga.count({
      where: { RukunWargaId: req.query.RukunWargaId },
    })

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

  async getByPk(id: string): Promise<RukunTetangga> {
    const data = await RukunTetangga.findByPk(id)

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async getById(id: string): Promise<RukunTetanggaDetailDto> {
    const data = await RukunTetangga.findOne({
      where: { id },
      include: [{ model: UserDetail, include: [{ model: User }] }],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
                      SELECT COUNT(*)
                      FROM user_details AS ud
                      WHERE ud.RukunTetanggaId = RukunTetangga.id
                    )`),
            'userCount',
          ],
        ],
      },
    })

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async add(formData: CreateRukunTetanggaDto): Promise<RukunTetanggaDto[]> {
    let data: any

    await db.sequelize!.transaction(async (transaction) => {
      const rw = await rukunWargaRepository.getByPk(formData.RukunWargaId)

      const latestRt = await RukunTetangga.findOne({
        where: { RukunWargaId: rw.id },
        attributes: ['name'],
        order: [['name', 'DESC']],
      })

      const rwBulkCreate = []

      for (let i = 1; i <= formData.count; i++) {
        rwBulkCreate.push({
          name: (latestRt?.name ? latestRt.name : 0) + i,
          RukunWargaId: rw.id,
        })
      }

      data = await RukunTetangga.bulkCreate(rwBulkCreate, { transaction })
    })

    return data
  }

  async update(id: string, formData: UpdateRukunTetanggaDto): Promise<void> {
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
