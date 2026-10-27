import { Request } from 'express'
import RukunWarga from '@/database/model/rukunWarga'
import { db } from '@/database/databaseConnection'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { RukunWargaQueryRepository } from './rukunWargaQueryRepository'
import {
  CreateRukunWargaDto,
  RukunWargaDetailDto,
  RukunWargaDto,
  UpdateRukunWargaDto,
} from '../dto'
import RukunTetangga from '@/database/model/rukunTetangga'
import { Op } from 'sequelize'
import UserDetail from '@/database/model/userDetail'
import { Sequelize } from 'sequelize-typescript'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'

export class RukunWargaRepository {
  async getAll(req: Request): Promise<{
    data: RukunWargaDto[]
    meta: { pagination: MetaPaginationDto }
  }> {
    const query = new RukunWargaQueryRepository(req)

    const data = await RukunWarga.findAll({
      ...query.queryFilter(),
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM rukun_tetanggas AS rt
              WHERE rt.RukunWargaId = RukunWarga.id
            )`),
            'rtCount',
          ],
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM user_details AS ud
              WHERE ud.RukunWargaId = RukunWarga.id
            )`),
            'userCount',
          ],
        ],
      },
    })

    const rtCount = await RukunTetangga.count({
      where: { RukunWargaId: { [Op.in]: data.map((e) => e.id) } },
    })

    const userCount = await UserDetail.count({
      where: { RukunWargaId: { [Op.in]: data.map((e) => e.id) } },
    })

    const dataCount = await RukunWarga.count()

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

  async getByPk(id: string): Promise<RukunWarga> {
    const data = await RukunWarga.findByPk(id)

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async getById(id: string): Promise<RukunWargaDetailDto> {
    const data = await RukunWarga.findOne({
      where: { id },
      include: [
        {
          model: RukunTetangga,
          attributes: {
            include: [
              [
                Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM user_details AS ud
                            WHERE ud.RukunTetanggaId = rukunTetangga.id
                          )`),
                'userCount',
              ],
            ],
          },
          as: 'rukunTetangga',
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM rukun_tetanggas AS rt
              WHERE rt.RukunWargaId = RukunWarga.id
            )`),
            'rtCount',
          ],
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM user_details AS ud
              WHERE ud.RukunWargaId = RukunWarga.id
            )`),
            'userCount',
          ],
        ],
      },
    })

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async add(formData: CreateRukunWargaDto): Promise<RukunWargaDto[]> {
    let data: any

    await db.sequelize!.transaction(async (transaction) => {
      const latestRw = await RukunWarga.findOne({
        attributes: ['name'],
        order: [['name', 'DESC']],
      })

      const rwBulkCreate = []

      for (let i = 1; i <= formData.count; i++) {
        rwBulkCreate.push({
          name: (latestRw?.name ? latestRw.name : 0) + i,
        })
      }

      data = await RukunWarga.bulkCreate(rwBulkCreate, { transaction })
    })

    return data
  }

  async update(id: string, formData: UpdateRukunWargaDto): Promise<void> {
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
