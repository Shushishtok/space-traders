import { AppError, ErrorNames } from '../../exceptions/app-error';
import { ShipNav, ShipCrew, ShipFuel, ShipFrame, ShipReactor, ShipEngine, ShipModule, ShipMount, ShipRegistration, ShipCargo } from '../../../packages/spacetraders-sdk';
import { Table, Model, Column, DataType } from 'sequelize-typescript';

@Table({ timestamps: false, tableName: 'ships' })
export class ShipModel extends Model {
	@Column({ primaryKey: true, type: DataType.STRING, allowNull: false })
		symbol!: string;

	@Column({ type: DataType.JSONB, allowNull: false })
		nav!: ShipNav;

	@Column({ type: DataType.JSONB, allowNull: false })
		crew!: ShipCrew;

	@Column({ type: DataType.JSONB, allowNull: false })
		fuel!: ShipFuel;

	@Column({ type: DataType.JSONB, allowNull: false })
		frame!: ShipFrame;

	@Column({ type: DataType.JSONB, allowNull: false })
		reactor!: ShipReactor;

	@Column({ type: DataType.JSONB, allowNull: false })
		engine!: ShipEngine;

	@Column({ type: DataType.JSONB, allowNull: false })
		modules!: ShipModule[];

	@Column({ type: DataType.JSONB, allowNull: false })
		mounts!: ShipMount[];

	@Column({ type: DataType.JSONB, allowNull: false })
		registration!: ShipRegistration;

	@Column({ type: DataType.JSONB, allowNull: false })
		cargo!: ShipCargo;

	static async getShip(shipSymbol: string) {
		const ship = await this.findByPk(shipSymbol);
		if (!ship) throw new AppError({
			description: `Could not find ship with ship symbol ${shipSymbol}`,
			httpCode: 500,
			name: ErrorNames.DB_ERROR,			
		});

		return ship;
	}
}