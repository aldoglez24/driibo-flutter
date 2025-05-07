import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shop_review_parameter')
export class ShopReviewParameterEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('bool')
  isGood!: boolean;

  @Column()
  name!: string;
}
