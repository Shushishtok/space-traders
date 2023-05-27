import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { MarketTradeGood, MarketTransaction, TradeGood } from '../../packages/spacetraders-sdk';

@Table({ tableName: 'markets' })
export class MarketModel extends Model {
	@Column({ allowNull: false, primaryKey: true, type: DataType.STRING })
	symbol!: string;

	@Column({ allowNull: false, type: DataType.JSONB })
	exports!: TradeGood[];

	@Column({ allowNull: false, type: DataType.JSONB })
	imports!: TradeGood[];

	@Column({ allowNull: false, type: DataType.JSONB })
	exchange!: TradeGood[];

	@Column({ type: DataType.JSONB })
	transactions!: MarketTransaction[];

	@Column({ type: DataType.JSONB })
	tradeGoods!: MarketTradeGood[];
}