export interface AcademicYearDto {
  id: string
  name: string
  isActive: boolean
  startDate?: string | null
  endDate?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateAcademicYearDto {
  name: string
  startDate?: string | null
  endDate?: string | null
}

export interface UpdateAcademicYearDto {
  name?: string
  startDate?: string | null
  endDate?: string | null
}
