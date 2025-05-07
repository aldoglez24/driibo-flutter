import { InputType, ObjectType } from '@nestjs/graphql';

@InputType('AppConfigInfoInput')
@ObjectType()
export class AppConfigInfo {
  logo!: string;
  name!: string;
  color!: string;
}
