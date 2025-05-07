import { ObjectType } from '@nestjs/graphql';
import { AppType, LicenseType } from './config.dto';

@ObjectType('LicenseInformation')
export class LicenseInformationDto {
  buyerName!: string;
  licenseType!: LicenseType;
  supportExpireDate!: Date;
  connectedApps!: AppType[];
}
