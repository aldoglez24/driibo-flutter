import { AppType, LicenseType } from './config.dto';

export class LicenseVerifyRemoteResponse {
  token!: string;
  buyerName?: string;
  licenseType?: LicenseType;
  purchasedAt?: string;
  supportExpiry?: string;
  connectedApps?: AppType[];
  benefits?: string[];
  drawbacks?: string[];
  availableUpgrades?: {
    type: LicenseType;
    price: number;
    benefits: string[];
  }[];
}
