import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShopCategoryEntity } from './shop-category.entity';
import { MediaEntity } from '../media.entity';
import { ShopReviewEntity } from './shop-review.entity';

@Entity('shop')
export class ShopEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @OneToOne(() => MediaEntity)
  @JoinColumn()
  image?: MediaEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToMany(() => ShopCategoryEntity, (category) => category.shops)
  categories!: ShopCategoryEntity[];

  @OneToMany(() => ShopReviewEntity, (review) => review.shop)
  reviews!: ShopReviewEntity[];
}
