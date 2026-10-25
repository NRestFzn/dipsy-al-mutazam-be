import * as yup from 'yup'

export const createFamilySchema = yup.object().shape({
  familyCardNumber: yup.string().required('validation.required'),
  headOfFamilyId: yup.string().required('validation.required'),
})

export const updateFamilyHeadSchema = yup.object().shape({
  headOfFamilyId: yup.string().required('validation.required'),
})

export const addFamilyMemberSchema = yup.object().shape({
  userId: yup.string().required('validation.required'),
})

export type CreateFamily = yup.InferType<typeof createFamilySchema>
export type UpdateFamilyHead = yup.InferType<typeof updateFamilyHeadSchema>
export type AddFamilyMember = yup.InferType<typeof addFamilyMemberSchema>
