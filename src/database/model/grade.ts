import { Column, DataType, HasMany, Table } from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import Class from './class'
import UserDetail from './userDetail'

@Table({ freezeTableName: true, tableName: 'grades' })
export default class Grade extends BaseSchema {
  @Column({ allowNull: false, type: DataType.STRING })
  name: string

  @Column({ type: DataType.ENUM('SMP', 'SMA'), allowNull: true })
  level: 'SMP' | 'SMA'

  @Column({ type: DataType.VIRTUAL })
  classCount: number

  @Column({ type: DataType.VIRTUAL })
  studentCount: number

  @HasMany(() => Class)
  classes: Class[]

  @HasMany(() => UserDetail)
  userDetails: UserDetail[]
}
