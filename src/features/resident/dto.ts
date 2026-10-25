import { EducationDto } from '../education/dto'
import { MarriageStatusDto } from '../marriageStatus/dto'
import { RoleDto } from '../role/dto'
import { RukunTetanggaDto } from '../rukunTetangga/dto'
import { RukunWargaDto } from '../rukunWarga/dto'
import { SalaryRangeDto } from '../salaryRange/dto'

export interface ResidentDto {
  id: string
  fullname: string
  email: string
  roles: RoleDto[]
  profilePicture?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ResidentDetailDto extends ResidentDto {
  userDetail: {
    profession: string
    nik?: string | null
    phoneNumber: string
    UserId: string
    RukunWargaId: string
    RukunTetanggaId: string
    MarriageStatusId: string
    EducationId: string
    SalaryRangeId: string
    gender: string
    birthDate: Date
    rukunWarga: RukunWargaDto
    rukunTetangga: RukunTetanggaDto
    marriageStatus: MarriageStatusDto
    education: EducationDto
    salaryRange: SalaryRangeDto
  }
}

export interface CreateResidentDto {
  fullname: string
  nik: string
  email?: string | null
  phoneNumber: string
  password: string
  confirmPassword: string
  gender: string
  profession: string
  isKader: boolean
  birthDate: Date
  RukunWargaId: string
  RukunTetanggaId: string
  MarriageStatusId: string
  EducationId: string
  SalaryRangeId: string
}

export interface UpdateResidentDto {
  fullname: string
  nik: string
  email: string
  phoneNumber: string
  password?: string | null
  confirmPassword?: string | null
  gender: string
  profession: string
  isKader: boolean
  birthDate: Date
  RukunWargaId: string
  RukunTetanggaId: string
  MarriageStatusId: string
  EducationId: string
  SalaryRangeId: string
}

export interface ResidentQueryFilterDto {
  fullname: string
}

export interface ResidentDetailQueryFilterDto {
  RukunWargaId: string
  RukunTetanggaId: string
  nik: string
}

export interface ResidentNikQueryDto {
  nik: string
}

export interface UpdateProfileDto {
  phoneNumber: string
  newPassword?: string
  confirmNewPassword?: string | null
  profession: string
  EducationId: string
  SalaryRangeId: string
}
