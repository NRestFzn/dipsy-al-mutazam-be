export interface CreateFamilyDto {
  familyCardNumber: string
  headOfFamilyId: string
}

export interface UpdateFamilyHeadDto {
  headOfFamilyId: string
}

export interface AddFamilyMemberDto {
  userId: string
}
