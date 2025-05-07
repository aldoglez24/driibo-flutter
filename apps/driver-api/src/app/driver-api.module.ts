import { DynamicModule, Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoService, DatabaseModule, entities } from '@ridy/database';
import { LicenseVerifyRemoteResponse } from '@ridy/database/../interfaces/license-verify-remote-response';
import { RedisModule } from '@songkeys/nestjs-redis';
import { join } from 'path';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SharedDriverService } from '@ridy/order/shared-driver.service';
import axios from 'axios';
import { existsSync, promises as fs } from 'fs';
import { AnnouncementsModule } from './announcemnts/announcements.module';
import { AuthModule } from './auth/auth.module';
import { validateToken } from './auth/jwt.strategy';
import { ChatModule } from './chat/chat.module';
import { ComplaintModule } from './complaint/complaint.module';
import { DriverApiSetupNotFoundController } from './driver-api-setup-not-found.controller';
import { DriverAPIController } from './driver-api.controller';
import { DriverModule } from './driver/driver.module';
import { FeedbacksModule } from './feedbacks/feedbacks.module';
import { OrderModule } from './order/order.module';
import { PayoutModule } from './payout/payout.module';
import { ServiceModule } from './service/service.module';
import { SOSModule } from './sos/sos.module';
import { UploadModule } from './upload/upload.module';
import { WalletModule } from './wallet/wallet.module';

@Module({})
export class DriverAPIModule {
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
            module: DriverAPIModule,
            imports: [],
            controllers: [DriverApiSetupNotFoundController],
          };
        }
        global.saltKey = verResult.data.token;
        global.license = verResult.data.data;
        return {
          module: DriverAPIModule,
          imports: [
            DatabaseModule,
            ServiceModule,
            FeedbacksModule,
            PayoutModule,
            SOSModule,
            ConfigModule.forRoot(),
            ScheduleModule.forRoot(),
            GraphQLModule.forRoot<ApolloDriverConfig>({
              driver: ApolloDriver,
              // cors: false,
              subscriptions: {
                'subscriptions-transport-ws': {
                  keepAlive: 5000,
                  onConnect: async (connectionParams: {
                    authToken: string;
                  }) => {
                    if (connectionParams.authToken) {
                      return validateToken(connectionParams.authToken);
                    }
                    throw new Error('Missing auth token!');
                  },
                },
              },
              autoSchemaFile: join(
                process.cwd(),
                'apps/driver-frontend/lib/core/graphql/schema.gql',
              ),
              buildSchemaOptions: {
                dateScalarMode: 'timestamp',
              },
            }),
            TypeOrmModule.forFeature(entities),
            AuthModule.register(),
            UploadModule,
            DriverModule,
            ChatModule,
            OrderModule,
            WalletModule,
            RedisModule.forRoot({
              closeClient: true,
              commonOptions: { db: 2 },
              config: {
                host: process.env.REDIS_HOST ?? 'localhost',
              },
            }),
            AnnouncementsModule,
            ComplaintModule,
          ],
          controllers: [DriverAPIController],
          providers: [CryptoService, SharedDriverService],
        };
      }
    }
    return {
      module: DriverAPIModule,
      imports: [],
      controllers: [DriverApiSetupNotFoundController],
    };
  }
}
