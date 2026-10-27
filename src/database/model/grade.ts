import { Column, DataType, HasMany, Table } from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import Class from './class'

@Table({ freezeTableName: true, tableName: 'grades' })
export default class Grade extends BaseSchema {
  @Column({ type: DataType.STRING, allowNull: false })
  name: string

  @Column({ type: DataType.ENUM('SMP', 'SMA'), allowNull: true })
  level: string

  @HasMany(() => Class)
  classes: Class[]
}
