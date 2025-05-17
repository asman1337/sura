import { Department } from "src/modules/departments/entities/department.entity";
import { OfficerRank } from "src/modules/officer-ranks/entities/officer-rank.entity";
import { Officer } from "src/modules/officers/entities/officer.entity";
import { Organization } from "src/modules/organizations/entities/organization.entity";
import { Unit } from "src/modules/units/entities/unit.entity";

// Define simplified types for the response
export type OfficerRankInfo = Pick<OfficerRank, 'id' | 'name' | 'abbreviation' | 'level'>;
export type OrganizationInfo = Pick<Organization, 'id' | 'name' | 'code' | 'type'>;
export type UnitInfo = Pick<Unit, 'id' | 'name' | 'code' | 'type'>;
export type DepartmentInfo = Pick<Department, 'id' | 'name'>;

// Define the officer info with nested relations
export interface OfficerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  badgeNumber: string;
  userType: string;
  gender?: string;
  profilePhotoUrl?: string;
  rank?: OfficerRankInfo | null;
  organization?: OrganizationInfo | null;
  primaryUnit?: UnitInfo | null;
  department?: DepartmentInfo | null;
}

export class AuthResponseDto {
  accessToken: string;
  officer: OfficerInfo;
} 