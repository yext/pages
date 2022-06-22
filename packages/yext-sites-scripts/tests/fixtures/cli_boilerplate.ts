export const CLI_BOILERPLATE_WITHOUT_UPGRADE_LINES = `This is a beta version of the Yext Command Line Interface

`;

export const CLI_BOILERPLATE_WITH_UPGRADE_LINES = `This is a beta version of the Yext Command Line Interface

Please upgrade the Yext CLI. Current version: 0.1_248. Top version: 0.1_250.

In order to upgrade, please run \`brew upgrade yext\`


`;

export const UPGRADE_LINES_OF_CLI_BOILERPLATE = `Please upgrade the Yext CLI. Current version: 0.1_248. Top version: 0.1_250.
In order to upgrade, please run \`brew upgrade yext\``;

export const REAL_FULL_OUTPUT = `This is a beta version of the Yext Command Line Interface

Some arbitrary text

Generated 2 files for stream "my-stream-id-1"
{
	"__": {
		"entityPageSet": {
			"plugin": {}
		},
		"name": "index",
		"streamId": "my-stream-id-1",
		"templateType": "JS"
	},
	"address": {
		"city": "Manchester",
		"countryCode": "US",
		"line1": "786 New Bushy Branch Road",
		"postalCode": "37355",
		"region": "TN"
	},
	"businessId": 0,
	"geocodedCoordinate": {
		"latitude": 35.480399,
		"longitude": -86.060931
	},
	"id": "4092",
	"key": "0:index:knowledgeGraph:45138271:en",
	"locale": "en",
	"meta": {
		"entityType": {
			"id": "location",
			"uid": 0
		},
		"locale": "en",
		"updateTimestamp": "2022-06-21T01:50:05Z"
	},
	"name": "Manchester Farm",
	"siteId": 0,
	"uid": 45138271
}`;
