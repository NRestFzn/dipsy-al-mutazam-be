import { Request } from 'express'
import User from '@/database/model/user'
import { db } from '@/database/databaseConnection'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import {
  StudentDetailQueryFilterRepository,
  StudentQueryRepository,
} from './studentQueryRepository'
import {
  CreateStudentDto,
  StudentDetailDto,
  StudentDto,
  UpdateStudentProfileDto,
  UpdateStudentDto,
} from '../dto'
import UserDetail from '@/database/model/userDetail'
import Grade from '@/database/model/grade'
import Class from '@/database/model/class'
import { RoleId } from '@/libs/constant/roleIds'
import { MetaPaginationDto } from '@/routes/version1/response/metaData'
import UserHasRoles from '@/database/model/userHasRoles'
import Role from '@/database/model/role'
import { AuthRepository } from '../../auth/repository/authRepository'
import { Op } from 'sequelize'

const authRepository = new AuthRepository()

export class StudentRepository {
  async getAll(
    req: Request
  ): Promise<{ data: StudentDto[]; meta: { pagination: MetaPaginationDto } }> {
    const query = new StudentQueryRepository(req)
    const detailQuery = new StudentDetailQueryFilterRepository(req)

    const detailFilter = detailQuery.queryFilter()

    const isDetailRequired = Boolean(
      detailQuery.GradeId ||
        detailQuery.ClassId ||
        detailQuery.nisn
    )

    const { rows: data, count: totalRows } = await User.findAndCountAll({
      ...query.queryFilter(),
      distinct: true,
      include: [
        {
          model: UserDetail,
          ...(detailFilter as any),
          required: isDetailRequired,
          include: [{ model: Grade }, { model: Class }],
        },
        {
          model: Role,
          where: {
            id: { [Op.in]: [RoleId.user] },
          },
          through: { attributes: [] },
        },
      ],
    })

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

  async getByPk(id: string): Promise<User> {
    const data = await User.findByPk(id)

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async getById(id: string): Promise<StudentDetailDto> {
    const data = await User.findOne({
      where: { id },
      include: [
        { model: Role, through: { attributes: [] } },
        {
          model: UserDetail,
          include: [{ model: Grade }, { model: Class }],
        },
      ],
    })

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  async getByNisn(nisn: string): Promise<StudentDetailDto> {
    const data = await User.findOne({
      include: [
        {
          model: Role,
          where: {
            id: { [Op.in]: [RoleId.user] },
          },
          through: { attributes: [] },
        },
        {
          model: UserDetail,
          where: { nisn },
          required: true,
          include: [{ model: Grade }, { model: Class }],
        },
      ],
    })

    if (!data) throw new ErrorResponse.NotFound('errors.notFound')

    return data
  }

  // Alias for backward compatibility
  async getByNik(nisn: string): Promise<StudentDetailDto> {
    return this.getByNisn(nisn)
  }

  async add(formData: CreateStudentDto): Promise<void> {
    let data: any

    const GradeId = formData.GradeId || formData.TingkatId
    const ClassId = formData.ClassId || formData.KelasId

    const duplicateNisn = await UserDetail.findOne({
      where: { nisn: formData.nisn },
    })

    if (duplicateNisn)
      throw new ErrorResponse.BaseResponse('auth.nisnUsed', 'Conflict', 409)

    if (!formData.email) {
      formData.email = authRepository.createEmailFromNisn(formData.nisn)
    }

    const duplicateEmail = await User.findOne({
      where: { email: formData.email },
    })

    if (duplicateEmail)
      throw new ErrorResponse.BaseResponse('auth.emailUsed', 'Conflict', 409)

    if (formData.phoneNumber) {
      const duplicatePhoneNumber = await UserDetail.findOne({
        where: { phoneNumber: formData.phoneNumber },
      })

      if (duplicatePhoneNumber)
        throw new ErrorResponse.BaseResponse('auth.phoneUsed', 'Conflict', 409)
    }

    await db.sequelize!.transaction(async (transaction) => {
      data = await User.create({ ...formData }, { transaction })

      await UserHasRoles.create(
        {
          RoleId: RoleId.user,
          UserId: data.id,
        },
        { transaction }
      )

      await UserDetail.create(
        {
          ...formData,
          nisn: formData.nisn,
          GradeId,
          ClassId,
          UserId: data.id,
        },
        { transaction }
      )
    })
  }

  async update(id: string, formData: UpdateStudentDto): Promise<void> {
    const data = await this.getByPk(id)

    const GradeId = formData.GradeId || formData.TingkatId
    const ClassId = formData.ClassId || formData.KelasId

    await db.sequelize!.transaction(async (transaction) => {
      await data.update({ ...formData }, { transaction })

      await UserDetail.update(
        {
          ...formData,
          nisn: formData.nisn,
          GradeId,
          ClassId,
        },
        { where: { UserId: data.id }, transaction }
      )
    })
  }

  async updateByToken(
    id: string,
    formData: UpdateStudentProfileDto
  ): Promise<void> {
    const data = await this.getByPk(id)

    await db.sequelize!.transaction(async (transaction) => {
      await data.update({ ...formData }, { transaction })

      await UserDetail.update(
        { ...formData },
        { where: { UserId: data.id }, transaction }
      )
    })
  }

  async delete(id: string): Promise<void> {
    const data = await this.getByPk(id)

    await data.destroy()
  }
}

// Backwards compatibility alias
export const ResidentRepository = StudentRepository
