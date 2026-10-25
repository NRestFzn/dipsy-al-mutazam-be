export interface EducationDto {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateEducationDto {
  name: string
}

export interface UpdateEducationDto {
  name: string
}

export interface EducationQueryFilterDto {
  name: string
}
