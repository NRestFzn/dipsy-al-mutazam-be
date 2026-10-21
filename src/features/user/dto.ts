import { RoleDto } from '../role/dto'

export interface UserDto {
  id: string
  fullname: string
  email: string
  roles: RoleDto[]
  profilePicture?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserDetailDto extends UserDto {
  userDetail: {
    GradeId?: string
    ClassId?: string
    nisn?: string
    nis?: string
    entryYear?: string
    academicYear?: string
    phoneNumber?: string
    gender?: string
    birthDate?: Date
    RukunWargaId?: string
    RukunTetanggaId?: string
    nik?: string
  }
}

export interface CreateUserDto {
  fullname: string
  email: string
  password: string
  RoleIds: string[]
}

export interface UpdateUserDto {
  fullname: string
  newPassword?: string | null
  confirmNewPassword?: string | null
}

export interface UserQueryFilterDto {
  fullname: string
}

export type UserLoginState = {
  uid: string
  RoleIds: string[]
}
