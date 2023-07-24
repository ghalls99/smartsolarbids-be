import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import AWS from 'aws-sdk';
import {processSignedUrl} from '../../libs/utils';

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
