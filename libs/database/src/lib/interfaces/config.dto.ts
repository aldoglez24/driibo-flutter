import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AppConfigInfo } from './app-config-info.dto';
import { LicenseInformationDto } from './license.dto';

@ObjectType()
export class CurrentConfiguration {
  purchaseCode?: string;
  backendMapsAPIKey?: string;
  adminPanelAPIKey?: string;
  firebaseProjectPrivateKey?: string;
  versionNumber?: number;
  companyLogo?: string;
  companyName?: string;
  @Field(() => AppConfigInfo, { nullable: true })
  taxi?: AppConfigInfo;
  @Field(() => AppConfigInfo, { nullable: true })
  shop?: AppConfigInfo;
  @Field(() => AppConfigInfo, { nullable: true })
  parking?: AppConfigInfo;
  mysqlHost?: string;
  mysqlPort?: string;
  mysqlUser?: string;
  mysqlPassword?: string;
  mysqlDatabase?: string;
  redisHost?: string;
  redisPort?: string;
  redisPassword?: string;
}

@ObjectType()
export class UploadResult {
  url!: string;
}

export enum UpdatePurchaseCodeStatus {
  OK = 'OK',
  INVALID = 'INVALID',
  OVERUSED = 'OVERUSED',
  CLIENT_FOUND = 'CLIENT_FOUND',
}

registerEnumType(UpdatePurchaseCodeStatus, {
  name: 'UpdatePurchaseCodeStatus',
});

@ObjectType()
export class UpdatePurchaseCodeResult {
  status!: UpdatePurchaseCodeStatus;
  message?: string;
  data?: UpdatePurchaseCodeData;
  clients?: UpdatePurchaseCodeClient[];
}

@ObjectType()
export class UpdatePurchaseCodeClient {
  id!: number;
  enabled!: number;
  ip!: string;
  port!: number;
  token!: string;
  purchase_id!: number;
  first_verified_at!: string;
  last_verified_at!: string;
}

@ObjectType()
export class UpdatePurchaseCodeData {
  license!: LicenseInformationDto;
  benefits!: string[];
  drawbacks!: string[];
  availableUpgrades!: AvaialbeUpgrade[];
}

@ObjectType()
export class AvaialbeUpgrade {
  type!: string;
  price!: number;
  benefits!: string[];
}

export enum UpdateConfigStatus {
  OK = 'OK',
  INVALID = 'INVALID',
}

registerEnumType(UpdateConfigStatus, { name: 'UpdateConfigStatus' });

export enum AppType {
  Taxi = 'taxi',
  Shop = 'shop',
  Parking = 'parking',
}

registerEnumType(AppType, { name: 'AppType' });

export enum LicenseType {
  Regular = 'Regular',
  Extended = 'Extended',
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
}

registerEnumType(LicenseType, { name: 'LicenseType' });

@ObjectType()
export class UpdateConfigResult {
  status!: UpdateConfigStatus;
  message?: string;
}
