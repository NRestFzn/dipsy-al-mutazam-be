import { Op } from 'sequelize'
import AcademicYear from '@/database/model/academicYear'
import UserDetail from '@/database/model/userDetail'
import HomeroomAssignment from '@/database/model/homeroomAssignment'
import CounselorClassAssignment from '@/database/model/counselorClassAssignment'
import { resolveCurrentAcademicYear } from '@/features/class/repository/classRepository'
import { ErrorResponse } from '@/libs/http/ErrorResponse'
import {
  AcademicYearDto,
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
} from '../dto'

export class AcademicYearRepository {
  async getAll(): Promise<AcademicYearDto[]> {
    const rows = await AcademicYear.findAll({ order: [['name', 'DESC']] })

    return rows.map((row) => row.toJSON() as AcademicYearDto)
  }

  async getCurrent(): Promise<string> {
    const active = await AcademicYear.findOne({ where: { isActive: true } })

    if (active?.name) return active.name

    return resolveCurrentAcademicYear()
  }

  async create(formData: CreateAcademicYearDto): Promise<AcademicYearDto> {
    const duplicate = await AcademicYear.findOne({
      where: { name: formData.name },
    })

    if (duplicate) {
      throw new ErrorResponse.BaseResponse(
        'Tahun ajaran sudah ada',
        'Conflict',
        409
      )
    }

    const row = await AcademicYear.create({
      name: formData.name,
      startDate: formData.startDate ?? null,
      endDate: formData.endDate ?? null,
      isActive: false,
    } as any)

    return row.toJSON() as AcademicYearDto
  }

  async update(
    id: string,
    formData: UpdateAcademicYearDto
  ): Promise<AcademicYearDto> {
    const row = await AcademicYear.findByPk(id)

    if (!row) throw new ErrorResponse.NotFound('Tahun ajaran tidak ditemukan')

    if (formData.name && formData.name !== row.name) {
      const duplicate = await AcademicYear.findOne({
        where: { name: formData.name },
      })

      if (duplicate) {
        throw new ErrorResponse.BaseResponse(
          'Tahun ajaran sudah ada',
          'Conflict',
          409
        )
      }
    }

    await row.update({
      ...(formData.name ? { name: formData.name } : {}),
      ...(formData.startDate !== undefined
        ? { startDate: formData.startDate }
        : {}),
      ...(formData.endDate !== undefined ? { endDate: formData.endDate } : {}),
    } as any)

    return row.toJSON() as AcademicYearDto
  }

  async activate(id: string): Promise<AcademicYearDto> {
    const row = await AcademicYear.findByPk(id)

    if (!row) throw new ErrorResponse.NotFound('Tahun ajaran tidak ditemukan')

    await AcademicYear.update({ isActive: false }, { where: {} })
    await row.update({ isActive: true })

    return row.toJSON() as AcademicYearDto
  }

  async delete(id: string): Promise<void> {
    const row = await AcademicYear.findByPk(id)

    if (!row) throw new ErrorResponse.NotFound('Tahun ajaran tidak ditemukan')

    if (row.isActive) {
      throw new ErrorResponse.BadRequest(
        'Tahun ajaran aktif tidak dapat dihapus'
      )
    }

    const usedBy = await Promise.all([
      UserDetail.count({ where: { academicYear: row.name } }),
      HomeroomAssignment.count({ where: { academicYear: row.name } }),
      CounselorClassAssignment.count({ where: { academicYear: row.name } }),
    ])

    if (usedBy.some((count) => count > 0)) {
      throw new ErrorResponse.BadRequest(
        'Tahun ajaran sudah dipakai data, tidak dapat dihapus'
      )
    }

    await row.destroy()
  }
}
