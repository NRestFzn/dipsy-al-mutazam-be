import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  IsUUID,
  Table,
} from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import { DataTypes } from 'sequelize'
import Questionnaire from './questionnaire'
import User from './user'
import QuestionnaireAnswer from './questionnaireAnswer'
import { QuestionnaireScoringResult } from '@/features/questionnaire/scoring'

@Table({ freezeTableName: true, tableName: 'questionnaire_submissions' })
export default class QuestionnaireSubmission extends BaseSchema {
  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataTypes.UUID })
  UserId: string

  @IsUUID(4)
  @ForeignKey(() => Questionnaire)
  @Column({ allowNull: false, type: DataTypes.UUID })
  QuestionnaireId: string

  @Column({ allowNull: false, type: DataTypes.UUID })
  SubmittedBy: string

  @Column({ allowNull: false, type: DataTypes.BOOLEAN })
  isAssisted: boolean

  @Column({ allowNull: true, type: DataTypes.INTEGER })
  score: number | null

  @Column({ allowNull: true, type: DataTypes.STRING })
  resultKey: string | null

  @Column({ allowNull: true, type: DataTypes.STRING })
  academicYear: string | null

  @Column({ allowNull: true, type: DataTypes.STRING })
  resultLabel: string | null

  @Column({ allowNull: true, type: DataTypes.BOOLEAN })
  isRisk: boolean | null

  @Column({ allowNull: true, type: DataTypes.JSON })
  scoringResult: QuestionnaireScoringResult | null

  @HasMany(() => QuestionnaireAnswer)
  questionnaireAnswer: QuestionnaireAnswer[]

  @BelongsTo(() => Questionnaire)
  questionnaire: Questionnaire

  @BelongsTo(() => User, 'UserId')
  user: User

  @BelongsTo(() => User, 'SubmittedBy')
  submittedBy: User
}
