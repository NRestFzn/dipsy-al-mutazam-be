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
import Class from './class'

@Table({ freezeTableName: true, tableName: 'counselor_class_assignments' })
export default class CounselorClassAssignment extends BaseSchema {
  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  UserId: string

  @BelongsTo(() => User, { foreignKey: 'UserId', as: 'counselor' })
  counselor: User

  @IsUUID(4)
  @ForeignKey(() => Class)
  @Column({ type: DataType.UUID, allowNull: false })
  ClassId: string

  @BelongsTo(() => Class)
  class: Class

  @Column({ type: DataType.STRING, allowNull: false })
  academicYear: string
}
