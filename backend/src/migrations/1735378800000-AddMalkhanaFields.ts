import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMalkhanaFields1735378800000 implements MigrationInterface {
    name = 'AddMalkhanaFields1735378800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new enum type for PropertyNature
        await queryRunner.query(`
            CREATE TYPE "public"."malkhana_items_propertynature_enum" AS ENUM(
                'STOLEN_PROPERTY',
                'INTESTATE_PROPERTY', 
                'UNCLAIMED_PROPERTY',
                'SUSPICIOUS_PROPERTY',
                'EXHIBITS_AND_OTHER_PROPERTY',
                'SAFE_CUSTODY_PROPERTY',
                'OTHERS'
            )
        `);

        // Add new columns to malkhana_items table
        await queryRunner.query(`
            ALTER TABLE "malkhana_items" 
            ADD COLUMN "prNumber" character varying(50),
            ADD COLUMN "gdeNumber" character varying(50),
            ADD COLUMN "propertyNature" "public"."malkhana_items_propertynature_enum",
            ADD COLUMN "receivedFromAddress" text,
            ADD COLUMN "investigatingOfficerName" character varying(200),
            ADD COLUMN "investigatingOfficerRank" character varying(100),
            ADD COLUMN "investigatingOfficerPhone" character varying(15),
            ADD COLUMN "investigatingOfficerUnit" character varying(200)
        `);

        // Update dateReceived column to timestamp if it's currently just date
        await queryRunner.query(`
            ALTER TABLE "malkhana_items" 
            ALTER COLUMN "dateReceived" TYPE timestamp
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the added columns
        await queryRunner.query(`
            ALTER TABLE "malkhana_items" 
            DROP COLUMN "prNumber",
            DROP COLUMN "gdeNumber", 
            DROP COLUMN "propertyNature",
            DROP COLUMN "receivedFromAddress",
            DROP COLUMN "investigatingOfficerName",
            DROP COLUMN "investigatingOfficerRank",
            DROP COLUMN "investigatingOfficerPhone",
            DROP COLUMN "investigatingOfficerUnit"
        `);

        // Change dateReceived back to date type
        await queryRunner.query(`
            ALTER TABLE "malkhana_items" 
            ALTER COLUMN "dateReceived" TYPE date
        `);

        // Drop the enum type
        await queryRunner.query(`
            DROP TYPE "public"."malkhana_items_propertynature_enum"
        `);
    }
}
