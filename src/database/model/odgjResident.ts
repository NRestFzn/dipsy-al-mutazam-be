import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  IsUUID,
  Table,
} from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import User from './user'
import OdgjExaminationSchedule from './odgjExaminationSchedule'

@Table({ freezeTableName: true, tableName: 'odgj_residents' })
export default class OdgjResident extends BaseSchema {
  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  UserId: string

  @BelongsTo(() => User)
  resident: User

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string

  @HasMany(() => OdgjExaminationSchedule)
  schedules: OdgjExaminationSchedule[]
}
