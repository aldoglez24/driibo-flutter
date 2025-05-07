import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CryptoService,
  DatabaseModule,
  entities,
  RedisPubSubProvider,
} from '@ridy/database';
import { LicenseVerifyRemoteResponse } from '@ridy/database/../interfaces/license-verify-remote-response';
import { GeoModule } from '@ridy/geo/geo.module';
import { SharedOrderModule } from '@ridy/order/shared-order.module';
import { RedisModule } from '@songkeys/nestjs-redis';
import axios from 'axios';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';
import { AddressModule } from './address/address.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { AuthModule } from './auth/auth.module';
import { validateToken } from './auth/jwt.strategy';
import { ChatModule } from './chat/chat.module';
import { ComplaintModule } from './complaint/complaint.module';
import { CouponModule } from './coupon/coupon.module';
import { DriverTendencyModule } from './driver_tendency/driver_tendency.module';
import { OrderModule } from './order/order.module';
import { RiderApiSetupNotFoundController } from './rider-api-setup-not-found.controller';
import { RiderAPIController } from './rider-api.controller';
import { RiderModule } from './rider/rider.module';
import { ServiceModule } from './service/service.module';
import { SOSModule } from './sos/sos.module';
import { UploadModule } from './upload/upload.module';
import { WalletModule } from './wallet/wallet.module';

@Module({})
export class RiderAPIModule {
  static async register(): Promise<DynamicModule> {
    const configAddress = `${process.cwd()}/config/config.${
      process.env.NODE_ENV ?? 'production'
    }.json`;
    Logger.log(`Config address: ${configAddress}`);
    if (existsSync(configAddress)) {
      const file = await fs.readFile(configAddress, { encoding: 'utf-8' });
      const config = JSON.parse(file as string);
      const firebaseKeyFileAddress = `${process.cwd()}/config/${
        config.firebaseProjectPrivateKey
      }`;
      if (
        config.firebaseProjectPrivateKey != null &&
        existsSync(firebaseKeyFileAddress)
      ) {
        const verResult = await axios.get<{
          status: 'OK' | 'FAILED';
          message: string;
          token?: string;
          data: LicenseVerifyRemoteResponse;
        }>(
          `http://31.220.15.49:9000/verify?purchaseCode=${
            config.purchaseCode
          }&port=${process.env.ADMIN_API_PORT || 3000}`,
        );
        Logger.log(verResult.data, 'Verification');
        if (verResult.data.status == 'FAILED') {
          Logger.error(verResult.data.message, 'Verification');
          return {
            module: RiderAPIModule,
            imports: [],
            controllers: [RiderApiSetupNotFoundController],
          };
        }
        global.saltKey = verResult.data.token;
        global.license = verResult.data.data;
        return {
          module: RiderAPIModule,
          imports: [
            DatabaseModule,
            GraphQLModule.forRoot<ApolloDriverConfig>({
              driver: ApolloDriver,
              installSubscriptionHandlers: true,
              autoSchemaFile: join(
                process.cwd(),
                'apps/rider-frontend/lib/config/graphql/schema.gql',
              ),
              buildSchemaOptions: {
                dateScalarMode: 'timestamp',
              },
              subscriptions: {
                'subscriptions-transport-ws': {
                  keepAlive: 5000,
                  onConnect: async (connectionParams) => {
                    Logger.log('connectionParams', connectionParams);
                    if (connectionParams.authToken) {
                      return validateToken(connectionParams.authToken);
                    }
                    throw new Error('Missing auth token!');
                  },
                },
              },
            }),
            TypeOrmModule.forFeature(entities),
            AuthModule.register(),
            UploadModule,
            RiderModule,
            ServiceModule,
            OrderModule,
            DriverTendencyModule,
            AddressModule,
            AnnouncementModule,
            GeoModule,
            SharedOrderModule,
            ComplaintModule,
            SOSModule,
            WalletModule,
            CouponModule,
            ConfigModule.forRoot(),
            RedisModule.forRoot({
              closeClient: true,
              commonOptions: { db: 2 },
              config: {
                host: process.env.REDIS_HOST ?? 'localhost',
              },
            }),
            ChatModule,
          ],
          providers: [CryptoService, RedisPubSubProvider.provider()],
          controllers: [RiderAPIController],
        };
      }
    }
    return {
      module: RiderAPIModule,
      imports: [],
      controllers: [RiderApiSetupNotFoundController],
    };
  }
}
