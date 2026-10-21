import { RoleDto } from '../role/dto'

export interface StudentDto {
  id: string
  fullname: string
  email: string
  roles: RoleDto[]
  profilePicture?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface StudentDetailDto extends StudentDto {
  userDetail: {
    id?: string
    UserId: string
    nisn?: string | null
    nis?: string | null
    entryYear?: string | null
    academicYear?: string | null
    phoneNumber?: string | null
    gender: string
    birthDate: Date
    GradeId?: string | null
    ClassId?: string | null
    grade?: any
    class?: any
  }
}

export interface CreateStudentDto {
  fullname: string
  nisn: string
  email?: string | null
  phoneNumber?: string | null
  password: string
  confirmPassword: string
  gender: string
  birthDate: Date
  GradeId: string
  ClassId: string
  TingkatId?: string
  KelasId?: string
  nis?: string | null
  entryYear?: string | null
  academicYear?: string | null
}

export interface UpdateStudentDto {
  fullname: string
  nisn: string
  email: string
  phoneNumber?: string | null
  password?: string | null
  confirmPassword?: string | null
  gender: string
  birthDate: Date
  GradeId: string
  ClassId: string
  TingkatId?: string
  KelasId?: string
  nis?: string | null
  entryYear?: string | null
  academicYear?: string | null
}

export interface StudentQueryFilterDto {
  fullname?: string
}

export interface StudentDetailQueryFilterDto {
  GradeId?: string
  ClassId?: string
  TingkatId?: string
  KelasId?: string
  nisn?: string
}

export interface StudentNisnQueryDto {
  nisn: string
}

export interface UpdateStudentProfileDto {
  phoneNumber?: string | null
  newPassword?: string | null
  confirmNewPassword?: string | null
}

// Aliases for backwards compatibility
export type ResidentDto = StudentDto
export type ResidentDetailDto = StudentDetailDto
export type CreateResidentDto = CreateStudentDto
export type UpdateResidentDto = UpdateStudentDto
export type ResidentQueryFilterDto = StudentQueryFilterDto
export type ResidentDetailQueryFilterDto = StudentDetailQueryFilterDto
export type ResidentNikQueryDto = StudentNisnQueryDto
export type UpdateProfileDto = UpdateStudentProfileDto
