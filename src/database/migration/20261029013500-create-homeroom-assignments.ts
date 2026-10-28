'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

/**
 * Default fallback academic year when `user_details` has no populated `academicYear`.
 */
const DEFAULT_FALLBACK_ACADEMIC_YEAR = '2025/2026'

/** @type {import('sequelize-cli').Migration} */
export async function up(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  // 1. Create homeroom_assignments table (idempotent)
  const [tables]: any = await queryInterface.sequelize.query(
    `SHOW TABLES LIKE 'homeroom_assignments'`
  )

  if (!tables || tables.length === 0) {
    await queryInterface.createTable('homeroom_assignments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      ClassId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'classes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      UserId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      academicYear: {
        allowNull: false,
        type: Sequelize.STRING(20),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  }

  // 2. Ensure indexes exist (idempotent)
  const [indexes]: any = await queryInterface.sequelize.query(
    `SHOW INDEX FROM \`homeroom_assignments\``
  )
  const existingIndexNames = new Set(
    (indexes || []).map((idx: any) => idx.Key_name)
  )

  if (!existingIndexNames.has('homeroom_assignments_class_year_unique')) {
    await queryInterface.addIndex(
      'homeroom_assignments',
      ['ClassId', 'academicYear'],
      {
        name: 'homeroom_assignments_class_year_unique',
        unique: true,
      }
    )
  }

  if (!existingIndexNames.has('homeroom_assignments_user_year_idx')) {
    await queryInterface.addIndex(
      'homeroom_assignments',
      ['UserId', 'academicYear'],
      {
        name: 'homeroom_assignments_user_year_idx',
      }
    )
  }

  // 3. Backfill from classes.homeroomTeacherId and drop column if it still exists
  const [columns]: any = await queryInterface.sequelize.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'classes'
       AND COLUMN_NAME = 'homeroomTeacherId'`
  )

  if (columns && columns.length > 0) {
    // Determine current academic year from the most frequently used academicYear in user_details,
    // falling back to DEFAULT_FALLBACK_ACADEMIC_YEAR ('2025/2026').
    const [yearRows]: any = await queryInterface.sequelize.query(
      `SELECT academicYear, COUNT(*) AS cnt
       FROM \`user_details\`
       WHERE academicYear IS NOT NULL AND academicYear != ''
       GROUP BY academicYear
       ORDER BY cnt DESC, academicYear DESC
       LIMIT 1`
    )

    const targetAcademicYear: string =
      yearRows && yearRows.length > 0 && yearRows[0].academicYear
        ? String(yearRows[0].academicYear)
        : DEFAULT_FALLBACK_ACADEMIC_YEAR

    const [classesWithHomeroom]: any = await queryInterface.sequelize.query(
      `SELECT id, homeroomTeacherId
       FROM \`classes\`
       WHERE homeroomTeacherId IS NOT NULL`
    )

    const now = new Date()

    for (const cls of classesWithHomeroom || []) {
      const [existing]: any = await queryInterface.sequelize.query(
        `SELECT id FROM \`homeroom_assignments\`
         WHERE ClassId = :ClassId AND academicYear = :academicYear
         LIMIT 1`,
        {
          replacements: {
            ClassId: cls.id,
            academicYear: targetAcademicYear,
          },
        }
      )

      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('homeroom_assignments', [
          {
            id: uuidv4(),
            ClassId: cls.id,
            UserId: cls.homeroomTeacherId,
            academicYear: targetAcademicYear,
            createdAt: now,
            updatedAt: now,
          },
        ])
      }
    }

    // Drop any foreign key constraint on classes.homeroomTeacherId before dropping the column
    const [fkRows]: any = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'classes'
         AND COLUMN_NAME = 'homeroomTeacherId'
         AND REFERENCED_TABLE_NAME IS NOT NULL`
    )

    for (const fk of fkRows || []) {
      if (fk.CONSTRAINT_NAME) {
        await queryInterface.removeConstraint('classes', fk.CONSTRAINT_NAME)
      }
    }

    await queryInterface.removeColumn('classes', 'homeroomTeacherId')
  }
}

export async function down(
  queryInterface: QueryInterface,
  Sequelize: typeof DataTypes
) {
  const [columns]: any = await queryInterface.sequelize.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'classes'
       AND COLUMN_NAME = 'homeroomTeacherId'`
  )

  if (!columns || columns.length === 0) {
    await queryInterface.addColumn('classes', 'homeroomTeacherId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  }

  const [tables]: any = await queryInterface.sequelize.query(
    `SHOW TABLES LIKE 'homeroom_assignments'`
  )

  if (tables && tables.length > 0) {
    const [assignments]: any = await queryInterface.sequelize.query(
      `SELECT ClassId, UserId
       FROM \`homeroom_assignments\`
       ORDER BY academicYear DESC, updatedAt DESC`
    )

    const updatedClasses = new Set<string>()
    for (const row of assignments || []) {
      if (!updatedClasses.has(row.ClassId)) {
        updatedClasses.add(row.ClassId)
        await queryInterface.sequelize.query(
          `UPDATE \`classes\` SET homeroomTeacherId = :UserId WHERE id = :ClassId`,
          {
            replacements: {
              UserId: row.UserId,
              ClassId: row.ClassId,
            },
          }
        )
      }
    }

    await queryInterface.dropTable('homeroom_assignments')
  }
}
