import * as yup from 'yup'

const academicYearName = yup
  .string()
  .required('validation.required')
  .matches(/^\d{4}\/\d{4}$/, 'validation.academicYear')
  .test('range', 'validation.academicYear', (value) => {
    if (!value) return false
    const [start, end] = value.split('/').map((item) => Number(item))
    return end === start + 1
  })

export const createAcademicYearSchema = yup.object().shape({
  name: academicYearName,
  startDate: yup.string().optional().nullable(),
  endDate: yup.string().optional().nullable(),
})

export const updateAcademicYearSchema = yup.object().shape({
  name: academicYearName.optional(),
  startDate: yup.string().optional().nullable(),
  endDate: yup.string().optional().nullable(),
})

export type CreateAcademicYear = yup.InferType<
  typeof createAcademicYearSchema
>
export type UpdateAcademicYear = yup.InferType<
  typeof updateAcademicYearSchema
>
