import {App} from '@serverless-stack/resources';
import SmartSolarBidApiStack from './SmartSolarBid/SmartSolarBid';
import SmartSolarStorageStack from './SmartSolarBid/StorageStack';

export default function (app: App) {
	app.setDefaultFunctionProps({
		runtime: 'nodejs16.x',
		srcPath: 'services',
		bundle: {
			format: 'esm',
		},
	});
	app.stack(SmartSolarBidApiStack);
	app.stack(SmartSolarStorageStack);
}
