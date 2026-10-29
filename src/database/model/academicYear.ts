import { Column, DataType, Table } from 'sequelize-typescript'
import BaseSchema from './_baseModel'

@Table({ freezeTableName: true, tableName: 'academic_years' })
export default class AcademicYear extends BaseSchema {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  name: string

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isActive: boolean

  @Column({ type: DataType.DATEONLY, allowNull: true })
  startDate: string

  @Column({ type: DataType.DATEONLY, allowNull: true })
  endDate: string
}
