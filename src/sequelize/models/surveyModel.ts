import { Table, Model, Column, DataType } from 'sequelize-typescript';
import { SurveyDeposit, SurveySizeEnum } from '../../../packages/spacetraders-sdk';
import { AppError, ErrorNames } from '../../exceptions/app-error';

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

	static async getSurvey(signature: string) {
		const survey = await this.findByPk(signature);
		if (!survey) throw new AppError({
			description: `Could not find survey with signature ${signature}`,
			httpCode: 500,
			name: ErrorNames.DB_ERROR,			
		});

		return survey;
	}
}