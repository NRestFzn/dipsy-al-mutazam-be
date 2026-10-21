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
import User from './user'

@Table({ freezeTableName: true, tableName: 'classes' })
export default class Class extends BaseSchema {
  @Column({ allowNull: false, type: DataType.STRING })
  name: string

  @IsUUID(4)
  @ForeignKey(() => Grade)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
  })
  GradeId: string

  @BelongsTo(() => Grade)
  grade: Grade

  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  homeroomTeacherId: string

  @BelongsTo(() => User, 'homeroomTeacherId')
  homeroomTeacher: User

  @Column({ type: DataType.VIRTUAL })
  studentCount: number

  @HasMany(() => UserDetail)
  userDetails: UserDetail[]
}
