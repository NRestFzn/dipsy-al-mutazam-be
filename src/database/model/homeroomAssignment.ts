import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Table,
} from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import Class from './class'
import User from './user'

@Table({ freezeTableName: true, tableName: 'homeroom_assignments' })
export default class HomeroomAssignment extends BaseSchema {
  @IsUUID(4)
  @ForeignKey(() => Class)
  @Column({ type: DataType.UUID, allowNull: false })
  ClassId: string

  @BelongsTo(() => Class)
  class: Class

  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  UserId: string

  @BelongsTo(() => User, { foreignKey: 'UserId', as: 'teacher' })
  teacher: User

  @Column({ type: DataType.STRING, allowNull: false })
  academicYear: string
}
