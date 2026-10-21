export interface LoginDto {
  email: string
  password: string
}

export interface LoginWithNisnDto {
  nisn: string
  password: string
}

export type LoginWithNikDto = LoginWithNisnDto

export interface RegisterDto {
  fullname: string
  nisn: string
  GradeId: string
  ClassId: string
  TingkatId?: string
  KelasId?: string
  birthDate: Date
  gender: string
  password: string
  confirmPassword: string
  email?: string | null
  phoneNumber?: string | null
  nis?: string | null
  entryYear?: string | null
  academicYear?: string | null

  // Backwards compatibility optional fields
  nik?: string
  profession?: string
  RukunWargaId?: string
  RukunTetanggaId?: string
  MarriageStatusId?: string
  EducationId?: string
  SalaryRangeId?: string
  isKader?: boolean
}

export interface AuthResponseDto {
  fullname: string
  email: string
  RoleIds: string[]
  uid: string
  accessToken: string
  expiresAt: Date
  expiresIn: number
}
