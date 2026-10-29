import { db } from '@/database/databaseConnection'
import Class from '@/database/model/class'
import CounselorClassAssignment from '@/database/model/counselorClassAssignment'
import Grade from '@/database/model/grade'
import StudentClassHistory from '@/database/model/studentClassHistory'
import User from '@/database/model/user'
import UserDetail from '@/database/model/userDetail'
import UserHasRoles from '@/database/model/userHasRoles'
import { RoleId } from '@/libs/constant/roleIds'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import { Op, WhereOptions } from 'sequelize'
import {
  CounselorAssignmentDto,
  CounselorAssignmentMeGroupDto,
  CounselorAssignmentQueryDto,
  ReplaceCounselorAssignmentDto,
} from '../dto'

export function getCalendarAcademicYear(now: Date = new Date()): string {
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-12
  if (month >= 7) {
    return `${year}/${year + 1}`
  }
  return `${year - 1}/${year}`
}

export class CounselorAssignmentRepository {
  async resolveDefaultAcademicYear(counselorUserId?: string): Promise<string> {
    const activeDetail = await UserDetail.findOne({
      where: {
        studentStatus: 'aktif',
        academicYear: {
          [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: '' }],
        },
      } as any,
      order: [['academicYear', 'DESC']],
    })

    if (activeDetail?.academicYear) {
      return activeDetail.academicYear
    }

    const allAssignments = await CounselorClassAssignment.findAll({
      attributes: ['academicYear'],
      group: ['academicYear'],
      order: [['academicYear', 'DESC']],
    })

    for (const item of allAssignments) {
      const historyCount = await StudentClassHistory.count({
        where: { academicYear: item.academicYear },
      })
      if (historyCount === 0) {
        return item.academicYear
      }
    }

    return getCalendarAcademicYear()
  }

  async getAll(
    query: CounselorAssignmentQueryDto
  ): Promise<CounselorAssignmentDto[]> {
    const where: WhereOptions<CounselorClassAssignment> = {}

    if (query.UserId) {
      where.UserId = query.UserId
    }

    if (query.academicYear) {
      where.academicYear = query.academicYear
    }

    const rows = await CounselorClassAssignment.findAll({
      where,
      include: [
        {
          model: Class,
          include: [{ model: Grade }],
        },
        {
          model: User,
          as: 'counselor',
          attributes: ['id', 'fullname', 'email'],
        },
      ],
      order: [
        ['academicYear', 'DESC'],
        ['createdAt', 'ASC'],
      ],
    })

    return rows.map((r) => {
      const json: any = r.toJSON()
      const cls = json.class || json.Class
      if (cls) {
        const grade = cls.grade || cls.Grade
        cls.grade = grade
        cls.Grade = grade
        json.class = cls
        json.Class = cls
      }
      return json as CounselorAssignmentDto
    })
  }

  async replace(
    formData: ReplaceCounselorAssignmentDto
  ): Promise<CounselorAssignmentDto[]> {
    const { UserId, academicYear } = formData
    const uniqueClassIds = Array.from(new Set(formData.ClassIds || []))

    const user = await User.findByPk(UserId)
    if (!user) {
      throw new ErrorResponse.NotFound('User tidak ditemukan')
    }

    const counselorRole = await UserHasRoles.findOne({
      where: {
        UserId,
        RoleId: RoleId.gurubk,
      },
    })

    if (!counselorRole) {
      throw new ErrorResponse.BadRequest('User harus memiliki role Guru BK')
    }

    if (uniqueClassIds.length > 0) {
      const existingClasses = await Class.findAll({
        where: {
          id: {
            [Op.in]: uniqueClassIds,
          },
        },
      })

      if (existingClasses.length !== uniqueClassIds.length) {
        throw new ErrorResponse.BadRequest(
          'Terdapat kelas yang tidak ditemukan'
        )
      }
    }

    await db.sequelize!.transaction(async (transaction) => {
      await CounselorClassAssignment.destroy({
        where: {
          UserId,
          academicYear,
        },
        transaction,
      })

      if (uniqueClassIds.length > 0) {
        await CounselorClassAssignment.bulkCreate(
          uniqueClassIds.map((ClassId) => ({
            UserId,
            ClassId,
            academicYear,
          })),
          { transaction }
        )
      }
    })

    return this.getAll({ UserId, academicYear })
  }

  async getMyAssignmentsGroupedByYear(
    userId: string,
    academicYear?: string
  ): Promise<CounselorAssignmentMeGroupDto[]> {
    const assignments = await this.getAll({
      UserId: userId,
      academicYear,
    })

    const groupedMap = new Map<string, CounselorAssignmentMeGroupDto>()

    for (const item of assignments) {
      let group = groupedMap.get(item.academicYear)
      if (!group) {
        group = {
          academicYear: item.academicYear,
          ClassIds: [],
          classes: [],
          assignments: [],
        }
        groupedMap.set(item.academicYear, group)
      }

      group.ClassIds.push(item.ClassId)
      if (item.Class) {
        group.classes.push({
          id: item.Class.id,
          name: item.Class.name,
          GradeId: item.Class.GradeId,
          Grade: item.Class.Grade,
        })
      }
      group.assignments.push(item)
    }

    return Array.from(groupedMap.values()).sort((a, b) =>
      b.academicYear.localeCompare(a.academicYear)
    )
  }

  async getAssignedClassIds(
    userId: string,
    academicYear: string
  ): Promise<string[]> {
    const rows = await CounselorClassAssignment.findAll({
      where: {
        UserId: userId,
        academicYear,
      },
      attributes: ['ClassId'],
    })

    return rows.map((r) => r.ClassId)
  }
}
