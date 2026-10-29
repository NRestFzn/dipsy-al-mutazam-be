export interface CounselorAssignmentDto {
  id: string
  UserId: string
  ClassId: string
  academicYear: string
  createdAt?: Date
  updatedAt?: Date
  class?: {
    id: string
    name: string
    GradeId: string
    homeroomTeacherId?: string | null
    grade?: {
      id: string
      name: string
      level?: string | null
    }
    Grade?: {
      id: string
      name: string
      level?: string | null
    }
  }
  Class?: {
    id: string
    name: string
    GradeId: string
    homeroomTeacherId?: string | null
    grade?: {
      id: string
      name: string
      level?: string | null
    }
    Grade?: {
      id: string
      name: string
      level?: string | null
    }
  }
  counselor?: {
    id: string
    fullname: string
    email?: string | null
  }
}

export interface ReplaceCounselorAssignmentDto {
  UserId: string
  academicYear: string
  ClassIds: string[]
}

export interface CounselorAssignmentQueryDto {
  UserId?: string
  academicYear?: string
}

export interface CounselorAssignmentMeGroupDto {
  academicYear: string
  ClassIds: string[]
  classes: Array<{
    id: string
    name: string
    GradeId: string
    Grade?: {
      id: string
      name: string
      level?: string | null
    }
  }>
  assignments: CounselorAssignmentDto[]
}
