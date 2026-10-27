import { RukunTetanggaDto } from '../rukunTetangga/dto'

export interface RukunWargaDto {
  id: string
  name: number
  rtCount: number
  userCount: number
  createdAt: Date
  updatedAt: Date
}

export interface RukunWargaDetailDto extends RukunWargaDto {
  rukunTetangga: Array<RukunTetanggaDto>
}

export interface CreateRukunWargaDto {
  count: number
}

export interface UpdateRukunWargaDto {
  name: number
}

export interface RukunWargaQueryFilterDto {
  name: number
}
