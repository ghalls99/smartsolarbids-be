import AWS from 'aws-sdk';
import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const s3 = new AWS.S3();

export const getSecret = async (key: string) => {
	const client = new SecretsManagerClient({
		region: 'us-west-2',
	});

	try {
		const response = await client.send(
			new GetSecretValueCommand({
				SecretId: key,
				VersionStage: 'AWSCURRENT', // VersionStage defaults to AWSCURRENT if unspecified
			}),
		);
		return response.SecretString;
	} catch (error) {
		throw error;
	}
};

export const dbQueryItem = async (tableName: string, params: object) => {
	try {
		// Make sure to provide the TableName property in the params object
		const queryInput = {
			TableName: tableName,
			...params,
		};

		const data = await ddb.query(queryInput).promise();
		console.log('Success:', data.Items);
		return data.Items;
	} catch (err) {
		console.log('Error:', err);
		throw err;
	}
};
export const dbPutItem = async (tableName: string, items: object) => {
	console.log(`items ${JSON.stringify(items)}`);
	const params = {
		TableName: tableName,
		Item: {...items},
	};

	const res = await ddb
		.putItem(params)
		.promise()
		.catch((error) => {
			console.log(error);
			return error;
		});

	return res;
};

export const processSignedUrl = async (
	bucketName: string,
	fileName: string,
	fileType: string,
) => {
	const params = {
		Bucket: bucketName,
		Key: fileName, // Use the 'name' property of the file as the object key
		Expires: 1200, // URL expiration time in seconds (1 hour)
		ContentType: fileType, // Use the 'type' property of the file as the Content-Type
	};
	return await s3.getSignedUrlPromise('putObject', params);
};
