import { RukunWargaDto } from '../rukunWarga/dto'

export interface RukunTetanggaDto {
  id: string
  name: number
  RukunWargaId: string
  userCount: number
  createdAt: Date
  updatedAt: Date
}

export interface RukunTetanggaDetailDto extends RukunTetanggaDto {
  rukunWarga: RukunWargaDto
}

export interface CreateRukunTetanggaDto {
  count: number
  RukunWargaId: string
}

export interface UpdateRukunTetanggaDto {
  name: number
}

export interface RukunTetanggaQueryFilterDto {
  name: number
  RukunWargaId: string
}
