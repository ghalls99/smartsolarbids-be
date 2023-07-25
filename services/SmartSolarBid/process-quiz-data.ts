import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {dbPutItem, processSignedUrl} from '../../libs/utils';
import {v4} from 'uuid';

export const main = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	// Parse the event body to get the required properties
	const {
		firstName,
		lastName,
		phoneNumber,
		email,
		electricBill,
		averageElectricCost,
		utilityProvider = '',
	}: {
		firstName: string;
		lastName: string;
		phoneNumber: string;
		email: string;
		homeSize: string;
		electricBill: {name: string; type: string};
		averageElectricCost: string;
		utilityProvider: string;
	} = JSON.parse(event.body || '{}');

	console.log(`event ${JSON.stringify(event.body)}`);

	try {
		const timestamp = new Date().toISOString();
		const uuid = v4();
		const res = await dbPutItem('bids-prod', {
			userId: {S: uuid},
			timestamp: {S: timestamp},
			firstName: {S: firstName},
			lastName: {S: lastName},
			phone: {S: phoneNumber || '11123123'},
			email: {S: email},
			electricBill: {S: JSON.stringify(electricBill)},
			averageElectricCost: {S: averageElectricCost},
			utilityProvider: {S: utilityProvider},
		});

		if (!res?.error) {
			console.log('successfully submitted data');
		} else {
			throw res.error;
		}

		if (electricBill?.name) {
			const signedUrl = await processSignedUrl(
				'bid-bucket-s3-prod',
				electricBill.name,
				electricBill.type,
			);

			console.log(signedUrl);

			return {
				statusCode: 200,
				body: JSON.stringify({
					name: electricBill.name,
					type: electricBill.type,
					signedUrl,
				}),
			};
		}
		return {
			statusCode: 200,
			body: JSON.stringify({
				name: 'no-file-selected',
				type: 'no-type-found',
				signedUrl: 'no-url-required',
			}),
		};
	} catch (error) {
		console.error('Error generating signed URLs:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({error: 'Error generating signed URLs.'}),
		};
	}
};
