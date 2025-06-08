import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaperDispatchTable1735985000000 implements MigrationInterface {
    name = 'CreatePaperDispatchTable1735985000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types for paper dispatch
        await queryRunner.query(`
            CREATE TYPE "public"."paper_dispatch_record_formtype_enum" AS ENUM(
                'part1',
                'part2', 
                'part4'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."paper_dispatch_record_registrytype_enum" AS ENUM(
                'BLACK_INK',
                'RED_INK'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."paper_dispatch_record_closedstatus_enum" AS ENUM(
                'open',
                'closed'
            )
        `);

        // Create paper dispatch records table
        await queryRunner.query(`
            CREATE TABLE "paper_dispatch_record" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" "public"."base_record_type_enum" NOT NULL DEFAULT 'paper_dispatch',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdById" character varying NOT NULL,
                "lastModifiedById" character varying,
                "status" "public"."base_record_status_enum" NOT NULL DEFAULT 'active',
                "unitId" character varying NOT NULL,
                "remarks" text,
                "notes" text,
                "isActive" boolean NOT NULL DEFAULT true,
                
                -- Paper dispatch specific fields
                "serialNumber" character varying(50) NOT NULL,
                "serialCount" integer NOT NULL,
                "serialYear" integer NOT NULL,
                "dateOfReceive" TIMESTAMP NOT NULL,
                "fromWhom" character varying(500) NOT NULL,
                "memoNumber" character varying(200),
                "purpose" text NOT NULL,
                "toWhom" character varying(500),
                "caseReference" character varying(200),
                "dateFixed" TIMESTAMP,
                "closedStatus" "public"."paper_dispatch_record_closedstatus_enum" NOT NULL DEFAULT 'open',
                "attachmentUrls" jsonb,
                "noExpectingReport" boolean NOT NULL DEFAULT false,
                "formType" "public"."paper_dispatch_record_formtype_enum" NOT NULL,
                "registryType" "public"."paper_dispatch_record_registrytype_enum" NOT NULL DEFAULT 'BLACK_INK',
                "dateTransitionToRed" TIMESTAMP,
                "endorsedOfficerName" character varying(200),
                "endorsedOfficerBadgeNumber" character varying(50),
                "isOverdue" boolean NOT NULL DEFAULT false,
                "daysElapsed" integer NOT NULL DEFAULT 0,
                
                -- Form-specific JSON fields
                "courtDetails" jsonb,
                "seniorOfficeDetails" jsonb,
                "publicPetitionDetails" jsonb,
                
                CONSTRAINT "PK_paper_dispatch_record" PRIMARY KEY ("id")
            )
        `);

        // Create indexes for better query performance
        await queryRunner.query(`
            CREATE INDEX "IDX_paper_dispatch_record_unitId" ON "paper_dispatch_record" ("unitId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_paper_dispatch_record_serial" ON "paper_dispatch_record" ("serialYear", "serialCount")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_paper_dispatch_record_registry" ON "paper_dispatch_record" ("registryType")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_paper_dispatch_record_date_receive" ON "paper_dispatch_record" ("dateOfReceive")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_paper_dispatch_record_overdue" ON "paper_dispatch_record" ("isOverdue")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_paper_dispatch_record_form_type" ON "paper_dispatch_record" ("formType")
        `);

        // Add unique constraint for serial number within a year
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_paper_dispatch_record_serial_unique" ON "paper_dispatch_record" ("serialYear", "serialCount", "unitId")
        `);

        // Update the base_record_type_enum to include paper_dispatch if not already present
        await queryRunner.query(`
            ALTER TYPE "public"."base_record_type_enum" ADD VALUE IF NOT EXISTS 'paper_dispatch'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the table and related indexes
        await queryRunner.query(`DROP TABLE "paper_dispatch_record"`);
        
        // Drop the enum types
        await queryRunner.query(`DROP TYPE "public"."paper_dispatch_record_formtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."paper_dispatch_record_registrytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."paper_dispatch_record_closedstatus_enum"`);
        
        // Note: We cannot easily remove the 'paper_dispatch' value from base_record_type_enum
        // as PostgreSQL doesn't support removing enum values directly
    }
}
