import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { SystemFaction, SystemType, SystemWaypoint } from '../../packages/spacetraders-sdk';

@Table({ tableName: 'systems' })
export class SystemModel extends Model {
	@Column({ allowNull: false, primaryKey: true, type: DataType.STRING })
		symbol!: string;

	@Column({ allowNull: false, type: DataType.STRING })
		sectorSymbol!: string;

	@Column({ allowNull: false, type: DataType.STRING })
		type!: SystemType;

	@Column({ allowNull: false, type: DataType.INTEGER })	
		x!: number;

	@Column({ allowNull: false, type: DataType.INTEGER })
		y!: number;

	@Column({ allowNull: false, type: DataType.JSONB })
		waypoints!: SystemWaypoint[];	

	@Column({ allowNull: false, type: DataType.JSONB })
		factions!: SystemFaction[];
}