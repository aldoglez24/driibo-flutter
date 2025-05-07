import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CurrentConfiguration,
  UpdateConfigResult,
  UpdateConfigStatus,
  UpdatePurchaseCodeResult,
} from '../../../../../libs/database/src/lib/interfaces/config.dto';
import { ConfigurationService } from './configuration.service';
import { UpdateConfigInput } from './update-config.input';
import { LicenseInformationDto } from '../../../../../libs/database/src/lib/interfaces/license.dto';
import { ConfigInformation } from '../../../../../libs/database/src/lib/interfaces/config-information.dto';
import { UpdateConfigInputV2 } from './dto/update-config.input';

@Resolver()
export class ConfigurationResolver {
  constructor(private configurationService: ConfigurationService) {}
  @Query(() => ConfigInformation)
  async configInformation(): Promise<ConfigInformation> {
    const config = await this.configurationService.getConfiguration();
    return {
      isValid: config.versionNumber != null || config.versionNumber != 1,
      config,
    };
  }

  @Query(() => LicenseInformationDto, { nullable: true })
  async licenseInformation(): Promise<LicenseInformationDto> {
    return this.configurationService.getLicenseInformation();
  }

  @Mutation(() => UpdateConfigResult)
  async updateConfigurations(
    @Args('input', { type: () => UpdateConfigInputV2 })
    input: UpdateConfigInputV2,
  ): Promise<UpdateConfigResult> {
    await this.configurationService.updateConfig(input);
    return {
      status: UpdateConfigStatus.OK,
    };
  }

  @Query(() => CurrentConfiguration)
  async currentConfiguration(): Promise<CurrentConfiguration> {
    const currentConfig = await this.configurationService.getConfiguration();
    if (process.env.DEMO_MODE != null) {
      return {
        purchaseCode: 'RESTRICTED',
        adminPanelAPIKey: currentConfig.adminPanelAPIKey,
        firebaseProjectPrivateKey: currentConfig.firebaseProjectPrivateKey,
      };
    }
    return currentConfig;
  }

  @Mutation(() => UpdatePurchaseCodeResult)
  async updatePurchaseCode(
    @Args('purchaseCode', { type: () => String }) purchaseCode: string,
    @Args('email', { type: () => String, nullable: true }) email?: string,
  ): Promise<UpdatePurchaseCodeResult> {
    return this.configurationService.updatePurchaseCode(purchaseCode, email);
  }

  @Mutation(() => UpdateConfigResult)
  async updateMapsAPIKey(
    @Args('backend', { type: () => String }) backend: string,
    @Args('adminPanel', { type: () => String }) adminPanel: string,
  ): Promise<UpdateConfigResult> {
    return this.configurationService.updateMapsAPIKey(backend, adminPanel);
  }

  @Mutation(() => UpdateConfigResult)
  async updateFirebase(
    @Args('keyFileName', { type: () => String }) keyFileName: string,
  ): Promise<UpdateConfigResult> {
    return this.configurationService.updateFirebase(keyFileName);
  }

  @Mutation(() => UpdateConfigResult)
  async disablePreviousServer(
    @Args('ip', { type: () => String }) ip: string,
    @Args('purchaseCode', { type: () => String, nullable: true })
    purchaseCode?: string,
  ): Promise<UpdateConfigResult> {
    return this.configurationService.disablePreviousServer({
      ip,
      purchaseCode,
    });
  }

  @Mutation(() => CurrentConfiguration)
  async saveConfiguration(
    @Args('input', { type: () => UpdateConfigInput })
    input: CurrentConfiguration,
  ) {
    return this.configurationService.saveConfiguration(input);
  }
}
