import * as yup from 'yup'

const roleName = yup
  .string()
  .oneOf(['gurubk', 'walikelas'], 'validation.oneOf')
  .required('validation.required')

export const createTeacherSchema = yup.object().shape({
  fullname: yup.string().required('validation.required'),
  email: yup.string().email('validation.email').required('validation.required'),
  password: yup
    .string()
    .min(8, 'validation.min')
    .required('validation.required'),
  roleName,
})

export const updateTeacherSchema = yup.object().shape({
  fullname: yup.string().optional(),
  email: yup.string().email('validation.email').optional(),
  password: yup.string().min(8, 'validation.min').optional().nullable(),
  roleName: yup
    .string()
    .oneOf(['gurubk', 'walikelas'], 'validation.oneOf')
    .optional(),
})

export const teacherQuerySchema = yup.object().shape({
  search: yup.string().optional(),
  roleName: yup
    .string()
    .oneOf(['gurubk', 'walikelas'], 'validation.oneOf')
    .optional(),
  page: yup.number().optional(),
  pageSize: yup.number().optional(),
})

export type CreateTeacher = yup.InferType<typeof createTeacherSchema>
export type UpdateTeacher = yup.InferType<typeof updateTeacherSchema>
export type TeacherQuery = yup.InferType<typeof teacherQuerySchema>
