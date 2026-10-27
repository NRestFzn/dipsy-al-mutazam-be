import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUUID,
  Table,
} from 'sequelize-typescript'
import BaseSchema from './_baseModel'
import OdgjResident from './odgjResident'

export enum OdgjExaminationStatus {
  scheduled = 'scheduled',
  completed = 'completed',
  missed = 'missed',
}

@Table({ freezeTableName: true, tableName: 'odgj_examination_schedules' })
export default class OdgjExaminationSchedule extends BaseSchema {
  @IsUUID(4)
  @ForeignKey(() => OdgjResident)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  OdgjResidentId: string

  @BelongsTo(() => OdgjResident)
  odgjResident: OdgjResident

  @Column({ type: DataType.DATEONLY, allowNull: false })
  examinationDate: Date

  @Column({
    type: DataType.ENUM(...Object.values(OdgjExaminationStatus)),
    allowNull: false,
    defaultValue: OdgjExaminationStatus.scheduled,
  })
  status: OdgjExaminationStatus

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string
}
