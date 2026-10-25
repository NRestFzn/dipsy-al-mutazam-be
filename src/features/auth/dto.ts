export interface LoginDto {
  email: string
  password: string
}

export interface LoginWithNikDto {
  nik: string
  password: string
}

export interface RegisterDto {
  fullname: string
  nik: string
  email?: string | null
  phoneNumber?: string | null
  password: string
  confirmPassword: string
  profession: string
  birthDate: Date
  RukunWargaId: string
  RukunTetanggaId: string
  MarriageStatusId: string
  EducationId: string
  SalaryRangeId: string
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
