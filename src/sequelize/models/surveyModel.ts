import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { SurveyDeposit, SurveySizeEnum } from '../../../packages/spacetraders-sdk';

@Table({ tableName: 'surveys' })
export class SurveyModel extends Model {
	@Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
		signature!: string;

	@Column({ type: DataType.JSONB, allowNull: false })
		deposits!: SurveyDeposit[];

	@Column({ type: DataType.STRING, allowNull: false })
		expiration!: string;

	@Column({ type: DataType.ENUM(...Object.values(SurveySizeEnum)), allowNull: false })
		size!: SurveySizeEnum;

	@Column({ type: DataType.STRING, allowNull: false })
		symbol!: string;
}