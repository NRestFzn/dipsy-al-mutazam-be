'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // 1. Create table grades if not exists
    const [gradesTableExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'grades'`,
      { transaction }
    )

    if (gradesTableExists.length === 0) {
      await queryInterface.createTable(
        'grades',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { transaction }
      )
    }

    // 2. Create table classes if not exists
    const [classesTableExists]: any = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'classes'`,
      { transaction }
    )

    if (classesTableExists.length === 0) {
      await queryInterface.createTable(
        'classes',
        {
          id: {
            allowNull: false,
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          GradeId: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
              model: 'grades',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
          },
        },
        { transaction }
      )
    }

    // 3. Seed default grades and classes if empty
    const [existingGrades]: any = await queryInterface.sequelize.query(
      `SELECT id FROM grades LIMIT 1`,
      { transaction }
    )

    if (existingGrades.length === 0) {
      const now = new Date()
      const gradesData = [
        {
          id: 'd9d6338c-9b61-464b-b2a6-b3a67ecfdc88',
          name: 'VII',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '4f6626d9-7186-4512-a0b0-0e4e2cb66212',
          name: 'VIII',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '69b08c1d-1d64-4df2-a314-78f5e01352a0',
          name: 'IX',
          createdAt: now,
          updatedAt: now,
        },
      ]

      await queryInterface.bulkInsert('grades', gradesData, { transaction })

      const classesData = [
        {
          id: 'ca887071-06dd-4ebf-bd31-e039abe5168f',
          name: 'VII-A',
          GradeId: 'd9d6338c-9b61-464b-b2a6-b3a67ecfdc88',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'e0a72f6f-0718-46b3-af3e-814c16734136',
          name: 'VII-B',
          GradeId: 'd9d6338c-9b61-464b-b2a6-b3a67ecfdc88',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '90641b6c-d505-44b1-8d1a-5ce375072204',
          name: 'VIII-A',
          GradeId: '4f6626d9-7186-4512-a0b0-0e4e2cb66212',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '20790452-e446-4d06-aec7-4614c42ece55',
          name: 'VIII-B',
          GradeId: '4f6626d9-7186-4512-a0b0-0e4e2cb66212',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: '50eefdf2-8d8d-446c-84dd-f14b1c201a89',
          name: 'IX-A',
          GradeId: '69b08c1d-1d64-4df2-a314-78f5e01352a0',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'dcd997c9-a7fe-4b05-a582-4451edf3f09c',
          name: 'IX-B',
          GradeId: '69b08c1d-1d64-4df2-a314-78f5e01352a0',
          createdAt: now,
          updatedAt: now,
        },
      ]

      await queryInterface.bulkInsert('classes', classesData, { transaction })
    }

    // 4. Remove foreign key constraints from user_details
    const columnsWithFk = [
      'RukunWargaId',
      'RukunTetanggaId',
      'EducationId',
      'SalaryRangeId',
      'MarriageStatusId',
    ]

    for (const col of columnsWithFk) {
      const [fks]: any = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'user_details' 
           AND COLUMN_NAME = '${col}' 
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { transaction }
      )

      for (const fk of fks) {
        await queryInterface.removeConstraint(
          'user_details',
          fk.CONSTRAINT_NAME,
          { transaction }
        )
      }
    }

    // 5. Remove unique index on nik if exists
    const [nikIndices]: any = await queryInterface.sequelize.query(
      `SELECT DISTINCT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'user_details' 
         AND (INDEX_NAME = 'unique_nik' OR COLUMN_NAME = 'nik')`,
      { transaction }
    )

    for (const idx of nikIndices) {
      if (idx.INDEX_NAME !== 'PRIMARY') {
        try {
          await queryInterface.removeIndex(
            'user_details',
            idx.INDEX_NAME,
            { transaction }
          )
        } catch {
          // Ignore if index already gone
        }
      }
    }

    // 6. Drop old columns from user_details
    const columnsToDrop = [
      'profession',
      'MarriageStatusId',
      'SalaryRangeId',
      'EducationId',
      'isKader',
      'RukunWargaId',
      'RukunTetanggaId',
      'nik',
    ]

    for (const col of columnsToDrop) {
      const [colExists]: any = await queryInterface.sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'user_details' 
           AND COLUMN_NAME = '${col}'`,
        { transaction }
      )

      if (colExists.length > 0) {
        await queryInterface.removeColumn('user_details', col, { transaction })
      }
    }

    // 7. Add new columns to user_details
    const newColumns: { [key: string]: any } = {
      nisn: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      GradeId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'grades',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      ClassId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'classes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      nis: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      entryYear: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      academicYear: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    }

    for (const [colName, colDef] of Object.entries(newColumns)) {
      const [colExists]: any = await queryInterface.sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'user_details' 
           AND COLUMN_NAME = '${colName}'`,
        { transaction }
      )

      if (colExists.length === 0) {
        await queryInterface.addColumn('user_details', colName, colDef, {
          transaction,
        })
      }
    }

    // 8. Add unique constraint for nisn
    const [nisnIndexExists]: any = await queryInterface.sequelize.query(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'user_details' 
         AND INDEX_NAME = 'unique_nisn'`,
      { transaction }
    )

    if (nisnIndexExists.length === 0) {
      await queryInterface.addConstraint('user_details', {
        fields: ['nisn'],
        type: 'unique',
        name: 'unique_nisn',
        transaction,
      })
    }

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const transaction = await queryInterface.sequelize.transaction()

  try {
    // 1. Remove unique_nisn
    try {
      await queryInterface.removeConstraint('user_details', 'unique_nisn', {
        transaction,
      })
    } catch {}

    // 2. Remove FKs on GradeId and ClassId
    for (const col of ['GradeId', 'ClassId']) {
      const [fks]: any = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'user_details' 
           AND COLUMN_NAME = '${col}' 
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { transaction }
      )

      for (const fk of fks) {
        await queryInterface.removeConstraint(
          'user_details',
          fk.CONSTRAINT_NAME,
          { transaction }
        )
      }
    }

    // 3. Drop student columns
    const columnsToDrop = [
      'academicYear',
      'entryYear',
      'nis',
      'ClassId',
      'GradeId',
      'nisn',
    ]

    for (const col of columnsToDrop) {
      const [colExists]: any = await queryInterface.sequelize.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'user_details' 
           AND COLUMN_NAME = '${col}'`,
        { transaction }
      )

      if (colExists.length > 0) {
        await queryInterface.removeColumn('user_details', col, { transaction })
      }
    }

    // 4. Re-add old columns
    await queryInterface.addColumn(
      'user_details',
      'profession',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'user_details',
      'isKader',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'user_details',
      'nik',
      {
        type: Sequelize.STRING(16),
        allowNull: true,
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'user_details',
      'RukunWargaId',
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'rukun_wargas',
          key: 'id',
        },
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'user_details',
      'RukunTetanggaId',
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'rukun_tetanggas',
          key: 'id',
        },
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'user_details',
      'EducationId',
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'educations',
          key: 'id',
        },
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'user_details',
      'SalaryRangeId',
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'salary_ranges',
          key: 'id',
        },
      },
      { transaction }
    )

    await queryInterface.addColumn(
      'user_details',
      'MarriageStatusId',
      {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'marriage_statuses',
          key: 'id',
        },
      },
      { transaction }
    )

    // 5. Drop classes and grades
    await queryInterface.dropTable('classes', { transaction })
    await queryInterface.dropTable('grades', { transaction })

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
