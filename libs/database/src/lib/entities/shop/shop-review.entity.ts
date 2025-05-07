import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ShopEntity } from './shop.entity';
import { ShopReviewStatus } from './enums/shop-review.status.enum';

@Entity('shop_review')
export class ShopReviewEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('tinyint')
  score!: number;

  @Column({ nullable: true })
  comment?: string;

  @Column('enum', {
    enum: ShopReviewStatus,
    default: ShopReviewStatus.Pending,
  })
  status!: ShopReviewStatus;

  @ManyToOne(() => ShopEntity, (shop) => shop.reviews)
  shop!: ShopEntity;

  @CreateDateColumn()
  createdAt!: Date;
}
