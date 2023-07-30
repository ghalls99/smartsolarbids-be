import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import AWS from 'aws-sdk';
import {dbPutItem, processSignedUrl} from '../../libs/utils';
import {v4} from 'uuid';

export const main = async (
	event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
	// Parse the event body to get the required properties
	const {
		files, // This should be an array of file objects with 'name' and 'type' properties
		firstName,
		lastName,
		phone,
		email,
	}: {
		files: {name: string; type: string}[];
		firstName: string;
		lastName: string;
		phone: string;
		email: string;
	} = JSON.parse(event.body || '{}');

	console.log(`event ${JSON.stringify(event.body)}`);

	const s3 = new AWS.S3();

	try {
		// Sending data to the desired dynamodb table for data recording
		const timestamp = new Date().toISOString();
		const uuid = v4();
		await dbPutItem('dev-smartsolarbids-bids-prod', {
			userId: {S: uuid},
			timestamp: {S: timestamp},
			firstName: {S: firstName},
			lastName: {S: lastName},
			phone: {S: phone || '11123123'},
			email: {S: email},
			electricBill: {S: JSON.stringify(files)},
		});

		const signedUrls = await Promise.all(
			files.map(async (file) => {
				const signedUrl = await processSignedUrl(
					'bid-bucket-s3-prod',
					file.name,
					file.type,
				);
				return {name: file.name, type: file.type, signedUrl};
			}),
		);

		return {statusCode: 200, body: JSON.stringify({urlData: signedUrls})};
	} catch (error) {
		console.error('Error generating signed URLs:', error);
		return {
			statusCode: 500,
			body: JSON.stringify({error: 'Error generating signed URLs.'}),
		};
	}
};
