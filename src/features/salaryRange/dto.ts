export interface SalaryRangeDto {
  id: string
  minRange: number
  maxRange: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateSalaryRangeDto {
  minRange: number
  maxRange: number
}

export interface UpdateSalaryRangeDto {
  minRange: number
  maxRange: number
}

export interface SalaryRangeQueryFilterDto {
  minRange: number
  maxRange: number
}
