import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import {
  CurrentConfiguration,
  LicenseType,
  UpdateConfigResult,
  UpdateConfigStatus,
  UpdatePurchaseCodeClient,
  UpdatePurchaseCodeResult,
  UpdatePurchaseCodeStatus,
} from '../../../../../libs/database/src/lib/interfaces/config.dto';
import * as fs from 'fs';
import * as util from 'util';
import { join } from 'path';
import * as fastify from 'fastify';
import { pipeline } from 'stream';
import { ForbiddenError } from '@nestjs/apollo';
import { LicenseInformationDto } from '../../../../../libs/database/src/lib/interfaces/license.dto';
import { LicenseVerifyRemoteResponse } from '../../../../../libs/database/src/lib/interfaces/license-verify-remote-response';
import { UpdateConfigInputV2 } from './dto/update-config.input';

const pump = util.promisify(pipeline);

@Injectable()
export class ConfigurationService {
  constructor(private httpService: HttpService) {}

  async getLicenseInformation(): Promise<LicenseInformationDto> {
    const licenseInformation: LicenseVerifyRemoteResponse = global.license;
    return {
      buyerName: licenseInformation.buyerName,
      licenseType: licenseInformation.licenseType,
      supportExpireDate: new Date(licenseInformation.supportExpiry),
      connectedApps: licenseInformation.connectedApps,
    };
  }

  async getConfiguration(): Promise<CurrentConfiguration | null> {
    const configAddress = `${process.cwd()}/config/config.${
      process.env.NODE_ENV ?? 'production'
    }.json`;
    if (fs.existsSync(configAddress)) {
      const file = await fs.promises.readFile(configAddress, {
        encoding: 'utf-8',
      });
      const config: CurrentConfiguration = JSON.parse(file as string);
      return config;
    } else {
      return new CurrentConfiguration();
    }
  }

  async saveConfiguration(
    newConfig: Partial<CurrentConfiguration>,
  ): Promise<boolean> {
    const config = await this.getConfiguration();
    if (process.env.DEMO_MODE != null) {
      throw new ForbiddenError('Cannot change configuration in demo mode.');
    }
    const finalConfig = Object.assign(config, newConfig);
    const str = JSON.stringify(finalConfig);
    await fs.promises.mkdir(`${process.cwd()}/config`, { recursive: true });
    await fs.promises.writeFile(
      `${process.cwd()}/config/config.${
        process.env.NODE_ENV ?? 'production'
      }.json`,
      str,
    );
    return true;
  }

  async updateConfig(
    input: UpdateConfigInputV2,
  ): Promise<CurrentConfiguration> {
    if (process.env.DEMO_MODE != null) {
      throw new ForbiddenError('Cannot change configuration in demo mode.');
    }
    await this.saveConfiguration(input);
    return input;
  }

  maskString(str?: string): string {
    if (str == null) {
      return null;
    }
    return str
      .split('')
      .map(() => '*')
      .join('');
  }

  async updatePurchaseCode(
    code: string,
    email?: string,
  ): Promise<UpdatePurchaseCodeResult> {
    let url = `http://31.220.15.49:9000/verify?purchaseCode=${code}&port=4001`;
    if (email) {
      url += `&email=${email}`;
    }
    const result = await firstValueFrom(
      this.httpService.get<{
        status: 'OK' | 'USED' | string;
        message?: string;
        data?: LicenseVerifyRemoteResponse;
        clients?: UpdatePurchaseCodeClient[];
      }>(url),
    );
    if (result.data.status == 'OK') {
      await this.saveConfiguration({ purchaseCode: code });
      return {
        status: UpdatePurchaseCodeStatus.OK,
        data: {
          license: {
            buyerName: result.data?.data?.buyerName ?? 'Unknown',
            licenseType: result.data?.data?.licenseType ?? LicenseType.Regular,
            supportExpireDate:
              result.data?.data != null
                ? new Date(result.data?.data?.supportExpiry)
                : new Date(),
            connectedApps: result.data?.data?.connectedApps ?? [],
          },
          benefits: result.data?.data?.benefits ?? [],
          drawbacks: result.data?.data?.drawbacks ?? [],
          availableUpgrades: result.data?.data?.availableUpgrades ?? [],
        },
      };
    } else if (result.data.status == 'USED') {
      return {
        status: UpdatePurchaseCodeStatus.CLIENT_FOUND,
        clients: result.data.clients,
      };
    } else {
      return {
        status: UpdatePurchaseCodeStatus.INVALID,
      };
    }
  }

  async updateMapsAPIKey(
    backend: string,
    adminPanel: string,
  ): Promise<UpdateConfigResult> {
    await this.saveConfiguration({
      backendMapsAPIKey: backend,
      adminPanelAPIKey: adminPanel,
    });
    return {
      status: UpdateConfigStatus.OK,
    };
  }

  async updateFirebase(keyFileName: string): Promise<UpdateConfigResult> {
    await this.saveConfiguration({ firebaseProjectPrivateKey: keyFileName });
    setTimeout(async () => {
      Logger.log('Restarting services', 'Configuration');
      await firstValueFrom(
        this.httpService.get('http://taxi-rider-api:3000/restart'),
      );
      await firstValueFrom(
        this.httpService.get('http://taxi-driver-api:3000/restart'),
      );
      process.exit(0);
    }, 1000);
    return {
      status: UpdateConfigStatus.OK,
    };
  }

  async disablePreviousServer(input: {
    ip: string;
    purchaseCode?: string;
  }): Promise<UpdateConfigResult> {
    const result = await firstValueFrom(
      this.httpService.get<{ status: 'OK' }>(
        `http://31.220.15.49:9000/disable_one?ip=${input.ip}`,
      ),
    );
    if (result.data.status == 'OK') {
      return { status: UpdateConfigStatus.OK };
    } else {
      return { status: UpdateConfigStatus.INVALID };
    }
  }

  async uploadFile(
    req: fastify.FastifyRequest,
    res: fastify.FastifyReply,
    dir: string,
    fileNamePrefix?: string,
  ) {
    let _fileName = '';
    const data = await req.file();
    await fs.promises.mkdir(dir, { recursive: true });
    _fileName = join(
      dir,
      fileNamePrefix != null
        ? `${fileNamePrefix}-${data.filename}`
        : data.filename,
    );
    await pump(data.file, fs.createWriteStream(_fileName));
    res.code(200).send({ address: _fileName });
  }
}
