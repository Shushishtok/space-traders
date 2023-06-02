import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { MarketTradeGood, MarketTransaction, TradeGood } from '../../packages/spacetraders-sdk';
import { AppError, ErrorNames } from '../../exceptions/app-error';

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

	static async getMarket(waypointSymbol: string) {
		const market = await this.findByPk(waypointSymbol);
		if (!market) throw new AppError({
			description: `Could not find market in waypoint symbol ${waypointSymbol}`,
			httpCode: 500,
			name: ErrorNames.DB_ERROR,			
		});

		return market;
	}
}