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
import StudentClassHistory from '@/database/model/studentClassHistory'
import {
  GraduateStudentsDto,
  PromoteStudentsDto,
} from '../dto'

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
        detailQuery.nisn ||
        (detailQuery.status && detailQuery.status !== 'semua')
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
            id: { [Op.in]: [RoleId.siswa] },
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
            id: { [Op.in]: [RoleId.siswa] },
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


  async add(formData: CreateStudentDto): Promise<void> {
    let data: any

    const GradeId = formData.GradeId
    const ClassId = formData.ClassId

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
          RoleId: RoleId.siswa,
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

    const GradeId = formData.GradeId
    const ClassId = formData.ClassId

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

  private async snapshotHistory(
    detail: UserDetail,
    academicYear: string,
    transaction: any
  ): Promise<void> {
    if (!detail.ClassId && !detail.GradeId) return

    const existing = await StudentClassHistory.findOne({
      where: { UserId: detail.UserId, academicYear },
      transaction,
    })

    if (existing) return

    const classData = detail.ClassId
      ? await Class.findByPk(detail.ClassId, { transaction })
      : null

    await StudentClassHistory.create(
      {
        UserId: detail.UserId,
        academicYear,
        GradeId: detail.GradeId,
        ClassId: detail.ClassId,
        homeroomTeacherId: classData?.homeroomTeacherId ?? null,
      } as any,
      { transaction }
    )
  }

  async promote(formData: PromoteStudentsDto): Promise<void> {
    await db.sequelize!.transaction(async (transaction) => {
      for (const item of formData.promotions) {
        const detail = await UserDetail.findOne({
          where: { UserId: item.studentId },
          transaction,
        })

        if (!detail) throw new ErrorResponse.NotFound('student.notFound')

        if (detail.academicYear && detail.academicYear !== formData.academicYear) {
          await this.snapshotHistory(detail, detail.academicYear, transaction)
        }

        const targetClass = await Class.findByPk(item.targetClassId, {
          transaction,
        })

        if (!targetClass) throw new ErrorResponse.NotFound('class.notFound')

        await detail.update(
          {
            GradeId: item.targetGradeId,
            ClassId: item.targetClassId,
            academicYear: formData.academicYear,
            studentStatus: 'aktif',
          },
          { transaction }
        )

        await StudentClassHistory.destroy({
          where: {
            UserId: item.studentId,
            academicYear: formData.academicYear,
          },
          transaction,
        })

        await StudentClassHistory.create(
          {
            UserId: item.studentId,
            academicYear: formData.academicYear,
            GradeId: item.targetGradeId,
            ClassId: item.targetClassId,
            homeroomTeacherId: targetClass.homeroomTeacherId ?? null,
            notes: item.notes ?? null,
          } as any,
          { transaction }
        )
      }
    })
  }

  async graduate(formData: GraduateStudentsDto): Promise<void> {
    await db.sequelize!.transaction(async (transaction) => {
      for (const studentId of formData.studentIds) {
        const detail = await UserDetail.findOne({
          where: { UserId: studentId },
          transaction,
        })

        if (!detail) throw new ErrorResponse.NotFound('student.notFound')

        if (detail.academicYear) {
          await this.snapshotHistory(detail, detail.academicYear, transaction)
        }

        await detail.update(
          {
            studentStatus: 'lulus',
            graduationYear: formData.graduationYear,
          },
          { transaction }
        )
      }
    })
  }

  async getTaughtHistory(teacherId: string): Promise<StudentClassHistory[]> {
    return StudentClassHistory.findAll({
      where: { homeroomTeacherId: teacherId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'fullname', 'email'],
          include: [
            {
              model: UserDetail,
              attributes: ['nisn', 'nis', 'studentStatus', 'graduationYear'],
            },
          ],
        },
        { model: Grade },
        { model: Class },
      ],
      order: [
        ['academicYear', 'DESC'],
        ['createdAt', 'ASC'],
      ],
    })
  }

  async getAcademicHistory(studentId: string): Promise<StudentClassHistory[]> {
    return StudentClassHistory.findAll({
      where: { UserId: studentId },
      include: [
        { model: Grade },
        { model: Class },
        {
          model: User,
          as: 'homeroomTeacher',
          attributes: ['id', 'fullname', 'email'],
        },
      ],
      order: [
        ['academicYear', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    })
  }

  async delete(id: string): Promise<void> {
    const data = await this.getByPk(id)

    await data.destroy()
  }
}
