import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArrestRecordTable1740000000000
  implements MigrationInterface
{
  name = 'CreateArrestRecordTable1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, update the base_record_type_enum to include arrest_record
    await queryRunner.query(`
      ALTER TYPE "public"."base_record_type_enum" ADD VALUE 'arrest_record'
    `);

    // Create enum types for arrest record
    await queryRunner.query(`
      CREATE TYPE "public"."arrest_record_parttype_enum" AS ENUM(
        'part1',
        'part2'
      )
    `);

    // Create arrest records table
    await queryRunner.query(`
      CREATE TABLE "arrest_record" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "public"."base_record_type_enum" NOT NULL DEFAULT 'arrest_record',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdById" character varying NOT NULL,
        "lastModifiedById" character varying,
        "status" "public"."base_record_status_enum" NOT NULL DEFAULT 'active',
        "unitId" character varying NOT NULL,
        "remarks" text,
        "notes" text,
        "isActive" boolean NOT NULL DEFAULT true,
        
        -- Serial Number tracking - Format: YYYYMMNNN (e.g., 202501001)
        "serialNumber" character varying(20) NOT NULL,
        "serialCount" integer NOT NULL,
        "serialYear" integer NOT NULL,
        "serialMonth" integer NOT NULL,
        
        -- Record type (Part 1 or Part 2)
        "partType" "public"."arrest_record_parttype_enum" NOT NULL,
        
        -- Accused Person Details
        "accusedName" character varying(200) NOT NULL,
        "accusedAddress" text NOT NULL,
        "accusedPhone" character varying(15),
        "accusedPCN" character varying(100),
        
        -- Arrest Details
        "dateOfArrest" TIMESTAMP NOT NULL,
        "arrestingOfficerName" character varying(200) NOT NULL,
        "dateForwardedToCourt" TIMESTAMP,
        
        -- Court Details
        "courtName" character varying(200),
        "courtAddress" character varying(100),
        "judgeNameOrCourtNumber" character varying(50),
        
        -- Case Reference
        "caseReference" character varying(100),
        "trialResult" character varying(500),
        
        -- Criminal Identification Fields (mainly for Part 1, optional for Part 2)
        "age" integer,
        "identifyingMarks" text,
        "height" decimal(5,2),
        "weight" decimal(5,2),
        "eyeColor" character varying(50),
        "hairColor" character varying(50),
        "complexion" character varying(50),
        "otherPhysicalFeatures" text,
        
        -- Photo attachments (1-4 photos, optional)
        "photoUrls" text[],
        
        -- Additional fields
        "arrestCircumstances" text,
        "arrestLocation" character varying(200),
        "recordDate" TIMESTAMP NOT NULL,
        "isIdentificationRequired" boolean NOT NULL DEFAULT true,
        
        CONSTRAINT "PK_arrest_record_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_arrest_record_serialNumber" UNIQUE ("serialNumber")
      )
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_arrest_record_unitId" ON "arrest_record" ("unitId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_arrest_record_createdById" ON "arrest_record" ("createdById")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_arrest_record_accusedName" ON "arrest_record" ("accusedName")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_arrest_record_dateOfArrest" ON "arrest_record" ("dateOfArrest")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_arrest_record_serialYear_Month" ON "arrest_record" ("serialYear", "serialMonth")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_arrest_record_partType" ON "arrest_record" ("partType")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_arrest_record_status_isActive" ON "arrest_record" ("status", "isActive")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.query(`DROP INDEX "IDX_arrest_record_status_isActive"`);
    await queryRunner.query(`DROP INDEX "IDX_arrest_record_partType"`);
    await queryRunner.query(`DROP INDEX "IDX_arrest_record_serialYear_Month"`);
    await queryRunner.query(`DROP INDEX "IDX_arrest_record_dateOfArrest"`);
    await queryRunner.query(`DROP INDEX "IDX_arrest_record_accusedName"`);
    await queryRunner.query(`DROP INDEX "IDX_arrest_record_createdById"`);
    await queryRunner.query(`DROP INDEX "IDX_arrest_record_unitId"`);

    // Drop the table
    await queryRunner.query(`DROP TABLE "arrest_record"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."arrest_record_parttype_enum"`);

    // Note: We don't remove 'arrest_record' from base_record_type_enum
    // as PostgreSQL doesn't support removing enum values
    // This is acceptable as the unused enum value won't cause issues
  }
}
