import { Field, InputType } from '@nestjs/graphql';
import { AppConfigInfo } from '../../../../../../libs/database/src/lib/interfaces/app-config-info.dto';

@InputType()
export class UpdateConfigInputV2 {
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  adminPanelAPIKey: string;
  backendMapsAPIKey: string;
  companyLogo: string;
  companyName: string;
  @Field(() => AppConfigInfo, { nullable: true })
  taxi?: AppConfigInfo;
  @Field(() => AppConfigInfo, { nullable: true })
  shop?: AppConfigInfo;
  @Field(() => AppConfigInfo, { nullable: true })
  parking?: AppConfigInfo;
  mysqlHost: string;
  mysqlPort: string;
  mysqlUser: string;
  mysqlPassword: string;
  mysqlDatabase: string;
  redisHost: string;
  redisPort: string;
  redisPassword: string;
  firebaseProjectPrivateKey: string;
}
