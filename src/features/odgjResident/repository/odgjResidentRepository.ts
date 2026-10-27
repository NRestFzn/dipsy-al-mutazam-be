import { Request } from 'express'
import { Includeable, Op, Transaction } from 'sequelize'
import { db } from '@/database/databaseConnection'
import OdgjExaminationSchedule from '@/database/model/odgjExaminationSchedule'
import OdgjResident from '@/database/model/odgjResident'
import User from '@/database/model/user'
import UserDetail from '@/database/model/userDetail'
import RukunWarga from '@/database/model/rukunWarga'
import RukunTetangga from '@/database/model/rukunTetangga'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'
import {
  CreateOdgjScheduleDto,
  CreateOdgjResidentDto,
  OdgjResidentDto,
  OdgjResidentCreationResultDto,
  OdgjScheduleCreationSummaryDto,
  UpdateOdgjScheduleDto,
  UpdateOdgjResidentDto,
} from '../dto'
import {
  buildOdgjScheduleCreationSummary,
  buildOdgjScheduleDates,
} from '../scheduleRecurrence'
import { OdgjResidentQueryRepository } from './odgjResidentQueryRepository'

export class OdgjResidentRepository {
  private async createSchedules(
    odgjResidentId: string,
    formData: CreateOdgjScheduleDto,
    transaction: Transaction
  ): Promise<OdgjScheduleCreationSummaryDto> {
    const {
      examinationDate,
      recurrenceType,
      recurrenceCount,
      status,
      notes,
    } = formData

    const dates = buildOdgjScheduleDates(
      examinationDate,
      recurrenceType,
      recurrenceCount
    )

    await OdgjExaminationSchedule.bulkCreate(
      dates.map((date) => ({
        OdgjResidentId: odgjResidentId,
        examinationDate: date,
        status: status || 'scheduled',
        notes,
      })),
      { transaction }
    )

    return buildOdgjScheduleCreationSummary(dates, recurrenceType)
  }

  private residentInclude(fullname?: string): Includeable[] {
    const residentWhere = fullname
      ? {
          fullname: {
            [Op.like]: `%${fullname}%`,
          },
        }
      : undefined

    return [
      {
        model: User,
        as: 'resident',
        required: Boolean(fullname),
        ...(residentWhere ? { where: residentWhere } : {}),
        include: [
          {
            model: UserDetail,
            include: [{ model: RukunWarga }, { model: RukunTetangga }],
          },
        ],
      },
      {
        model: OdgjExaminationSchedule,
        as: 'schedules',
        separate: true,
        order: [['examinationDate', 'ASC']],
      },
    ]
  }

  async getAll(req: Request): Promise<{
    data: OdgjResidentDto[]
    meta: { pagination: MetaPaginationDto }
  }> {
    const query = new OdgjResidentQueryRepository(req)

    const { rows: data, count: totalRows } = await OdgjResident.findAndCountAll(
      {
        ...query.queryFilter(),
        distinct: true,
        include: this.residentInclude(query.fullname),
      }
    )

    return {
      data,
      meta: {
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          pageCount: data.length,
          total: totalRows,
        },
      },
    }
  }

  async getById(id: string): Promise<OdgjResidentDto> {
    const data = await OdgjResident.findByPk(id, {
      include: this.residentInclude(),
    })

    if (!data) throw new ErrorResponse.NotFound('odgjResident.notFound')

    return data
  }

  async create(
    formData: CreateOdgjResidentDto
  ): Promise<OdgjResidentCreationResultDto> {
    const resident = await UserDetail.findOne({
      where: { UserId: formData.UserId },
    })

    if (!resident) throw new ErrorResponse.NotFound('odgjResident.residentNotFound')

    const duplicate = await OdgjResident.findOne({
      where: { UserId: formData.UserId },
    })

    if (duplicate) {
      throw new ErrorResponse.BaseResponse(
        'odgjResident.duplicate',
        'Conflict',
        409
      )
    }

    let odgjResidentId = ''
    let schedule: OdgjScheduleCreationSummaryDto | undefined

    await db.sequelize!.transaction(async (transaction) => {
      const data = await OdgjResident.create(
        {
          UserId: formData.UserId,
          notes: formData.notes,
        },
        { transaction }
      )

      odgjResidentId = data.id

      if (formData.examinationDate) {
        schedule = await this.createSchedules(
          data.id,
          {
            examinationDate: formData.examinationDate,
            status: formData.status || 'scheduled',
            notes: formData.notes,
            recurrenceType: formData.recurrenceType,
            recurrenceCount: formData.recurrenceCount,
          },
          transaction
        )
      }
    })

    return {
      data: await this.getById(odgjResidentId),
      schedule,
    }
  }

  async update(
    id: string,
    formData: UpdateOdgjResidentDto
  ): Promise<OdgjResidentDto> {
    const data = await OdgjResident.findByPk(id)

    if (!data) throw new ErrorResponse.NotFound('odgjResident.notFound')

    await db.sequelize!.transaction(async (transaction) => {
      await data.update({ ...formData }, { transaction })
    })

    return this.getById(data.id)
  }

  async createSchedule(
    odgjResidentId: string,
    formData: CreateOdgjScheduleDto
  ): Promise<OdgjResidentCreationResultDto> {
    const data = await OdgjResident.findByPk(odgjResidentId)

    if (!data) throw new ErrorResponse.NotFound('odgjResident.notFound')

    let schedule: OdgjScheduleCreationSummaryDto | undefined

    await db.sequelize!.transaction(async (transaction) => {
      schedule = await this.createSchedules(data.id, formData, transaction)
    })

    return {
      data: await this.getById(data.id),
      schedule,
    }
  }

  async updateSchedule(
    odgjResidentId: string,
    scheduleId: string,
    formData: UpdateOdgjScheduleDto
  ): Promise<OdgjResidentDto> {
    const schedule = await OdgjExaminationSchedule.findOne({
      where: { id: scheduleId, OdgjResidentId: odgjResidentId },
    })

    if (!schedule)
      throw new ErrorResponse.NotFound('odgjResident.scheduleNotFound')

    await db.sequelize!.transaction(async (transaction) => {
      await schedule.update({ ...formData }, { transaction })
    })

    return this.getById(odgjResidentId)
  }

  async deleteSchedule(
    odgjResidentId: string,
    scheduleId: string
  ): Promise<OdgjResidentDto> {
    const schedule = await OdgjExaminationSchedule.findOne({
      where: { id: scheduleId, OdgjResidentId: odgjResidentId },
    })

    if (!schedule)
      throw new ErrorResponse.NotFound('odgjResident.scheduleNotFound')

    await schedule.destroy()

    return this.getById(odgjResidentId)
  }

  async delete(id: string): Promise<void> {
    const data = await OdgjResident.findByPk(id)

    if (!data) throw new ErrorResponse.NotFound('odgjResident.notFound')

    await data.destroy()
  }
}
