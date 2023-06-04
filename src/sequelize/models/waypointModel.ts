import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { Chart, WaypointFaction, WaypointOrbital, WaypointTrait, WaypointType } from '../../packages/spacetraders-sdk';

@Table({ tableName: 'waypoints' })
export class WaypointModel extends Model {
	@Column({ allowNull: false, primaryKey: true, type: DataType.STRING })
		symbol!: string;

	@Column({ allowNull: false, type: DataType.STRING })
		systemSymbol!: string;

	@Column({ allowNull: false, type: DataType.STRING })
		type!: WaypointType;

	@Column({ allowNull: false, type: DataType.INTEGER })	
		x!: number;

	@Column({ allowNull: false, type: DataType.INTEGER })
		y!: number;

	@Column({ allowNull: false, type: DataType.JSONB })
		orbitals!: WaypointOrbital[];	

	@Column({ type: DataType.JSONB })
		faction!: WaypointFaction;

	@Column({ allowNull: false, type: DataType.JSONB })
		traits!: WaypointTrait[];

	@Column({ type: DataType.JSONB })
		chart!: Chart;
}