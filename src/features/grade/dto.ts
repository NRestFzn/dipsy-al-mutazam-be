import { ClassDto } from '../class/dto'

export interface GradeDto {
  id: string
  name: string
  level?: 'SMP' | 'SMA' | null
  classCount?: number
  studentCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface GradeDetailDto extends GradeDto {
  classes: Array<ClassDto>
}

export interface CreateGradeDto {
  name: string
  level?: 'SMP' | 'SMA' | null
}

export interface UpdateGradeDto {
  name?: string | null
  level?: 'SMP' | 'SMA' | null
}

export interface GradeQueryFilterDto {
  name?: string
  level?: string
}

// Backwards compatibility aliases for RukunWarga
export type RukunWargaDto = GradeDto
export type RukunWargaDetailDto = GradeDetailDto
export type CreateRukunWargaDto = any
export type UpdateRukunWargaDto = any
export type RukunWargaQueryFilterDto = any
