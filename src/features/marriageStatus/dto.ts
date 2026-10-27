export interface MarriageStatusDto {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateMarriageStatusDto {
  name: string
}

export interface UpdateMarriageStatusDto {
  name: string
}

export interface MarriageStatusQueryFilterDto {
  name: string
}
