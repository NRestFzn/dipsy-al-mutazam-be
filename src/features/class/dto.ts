import { GradeDto } from '../grade/dto'

export interface ClassDto {
  id: string
  name: string
  GradeId: string
  homeroomTeacherId?: string | null
  studentCount?: number
  grade?: GradeDto
  homeroomTeacher?: any
  createdAt: Date
  updatedAt: Date
}

export interface ClassDetailDto extends ClassDto {
  grade: GradeDto
  students?: any[]
}

export interface CreateClassDto {
  name: string
  GradeId: string
  homeroomTeacherId?: string | null
  waliKelasId?: string | null
}

export interface UpdateClassDto {
  name?: string | null
  GradeId?: string | null
  homeroomTeacherId?: string | null
  waliKelasId?: string | null
}

export interface ClassQueryFilterDto {
  name?: string
  GradeId?: string
}

// Backwards compatibility aliases for RukunTetangga
export type RukunTetanggaDto = ClassDto
export type RukunTetanggaDetailDto = ClassDetailDto
export type CreateRukunTetanggaDto = any
export type UpdateRukunTetanggaDto = any
export type RukunTetanggaQueryFilterDto = any
