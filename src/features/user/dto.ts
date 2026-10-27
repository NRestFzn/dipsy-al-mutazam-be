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
    RukunWargaId: string
    RukunTetanggaId: string
    MarriageStatusId: string
    EducationId: string
    SalaryRangeId: string
    profession: string
    nik: string
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
