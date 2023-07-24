import {Bucket, Table, StackContext} from '@serverless-stack/resources';

export function SmartSolarStorageStack({stack}: StackContext) {
	const env = stack.node.tryGetContext('env') || 'dev';

	const bucket = new Bucket(stack, 'Bucket', {
		name: `bid-bucket-s3-dev-2`,
	});

	bucket.attachPermissions('*');

	const table = new Table(stack, `bids-dev-2`, {
		fields: {
			userId: 'string',
			timestamp: 'string',
		},
		primaryIndex: {partitionKey: 'userId', sortKey: 'timestamp'},
	});

	table.attachPermissions('*');
}

export default SmartSolarStorageStack;
