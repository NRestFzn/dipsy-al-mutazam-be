import { RoleDto } from '../role/dto'

export interface TeacherHomeroomClassDto {
  id: string
  name: string
  gradeName?: string | null
}

export interface TeacherDto {
  id: string
  fullname: string
  email: string
  profilePicture?: string | null
  roles: RoleDto[]
  homeroomClasses: TeacherHomeroomClassDto[]
  counselorClasses?: TeacherHomeroomClassDto[]
  createdAt?: Date
  updatedAt?: Date
}

export interface CreateTeacherDto {
  fullname: string
  email: string
  password: string
  roleName: 'gurubk' | 'walikelas'
}

export interface UpdateTeacherDto {
  fullname?: string
  email?: string
  password?: string | null
  roleName?: 'gurubk' | 'walikelas'
}

export type TeacherRoleName = 'gurubk' | 'walikelas'
