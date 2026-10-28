import { GradeDto } from '../grade/dto'

export interface ClassDto {
  id: string
  name: string
  GradeId: string
  academicYear?: string
  homeroomTeacherId?: string | null
  studentCount?: number
  grade?: GradeDto
  homeroomTeacher?: {
    id: string
    fullname: string
    email?: string | null
  } | null
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
  academicYear?: string | null
  homeroomTeacherId?: string | null
}

export interface UpdateClassDto {
  name?: string | null
  GradeId?: string | null
  academicYear?: string | null
  homeroomTeacherId?: string | null
}

export interface ClassQueryFilterDto {
  name?: string
  GradeId?: string
  academicYear?: string
}
