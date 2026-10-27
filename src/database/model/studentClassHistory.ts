import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Table,
} from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import User from './user'
import Grade from './grade'
import Class from './class'

@Table({ freezeTableName: true, tableName: 'student_class_histories' })
export default class StudentClassHistory extends BaseSchema {
  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  UserId: string

  @BelongsTo(() => User, { foreignKey: 'UserId', as: 'student' })
  student: User

  @Column({ type: DataType.STRING, allowNull: false })
  academicYear: string

  @IsUUID(4)
  @ForeignKey(() => Grade)
  @Column({ type: DataType.UUID, allowNull: true })
  GradeId: string

  @BelongsTo(() => Grade)
  grade: Grade

  @IsUUID(4)
  @ForeignKey(() => Class)
  @Column({ type: DataType.UUID, allowNull: true })
  ClassId: string

  @BelongsTo(() => Class)
  class: Class

  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  homeroomTeacherId: string

  @BelongsTo(() => User, { foreignKey: 'homeroomTeacherId', as: 'homeroomTeacher' })
  homeroomTeacher: User

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string
}
