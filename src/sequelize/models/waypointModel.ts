import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { Chart, SystemType, WaypointFaction, WaypointOrbital, WaypointTrait } from '../../packages/spacetraders-sdk';

@Table({ tableName: 'waypoints' })
export class WaypointModel extends Model {
	@Column({ allowNull: false, primaryKey: true, type: DataType.STRING })
	symbol!: string;

	@Column({ allowNull: false, type: DataType.STRING })
	systemSymbol!: string;

	@Column({ allowNull: false, type: DataType.STRING })
	type!: SystemType;

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
	chart!: Chart
}