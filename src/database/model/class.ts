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
import Grade from './grade'
import UserDetail from './userDetail'

@Table({ freezeTableName: true, tableName: 'classes' })
export default class Class extends BaseSchema {
  @Column({ type: DataType.STRING, allowNull: false })
  name: string

  @IsUUID(4)
  @ForeignKey(() => Grade)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  GradeId: string

  @BelongsTo(() => Grade)
  grade: Grade

  @IsUUID(4)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  homeroomTeacherId: string

  @HasMany(() => UserDetail)
  students: UserDetail[]
}
