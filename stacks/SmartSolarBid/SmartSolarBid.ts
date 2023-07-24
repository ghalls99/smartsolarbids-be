import {StackContext, Api} from '@serverless-stack/resources';

export function SmartSolarBidApiStack({stack}: StackContext) {
	const api = new Api(stack, 'smartsolarbid-api', {
		defaults: {
			function: {
				timeout: '15 minutes',
				environment: {},
			},
		},

		routes: {
			'POST /upload-quiz-data': 'SmartSolarBid/process-quiz-data.main',
			'POST /upload-file': 'SmartSolarBid/send-bid-data.main',
		},
	});

	api.attachPermissions(['dynamodb', 's3']);

	stack.addOutputs({
		ApiEndpoint: api.url,
	});
}

export default SmartSolarBidApiStack;
