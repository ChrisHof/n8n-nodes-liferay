import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow'
import { headlessApiFields } from './descriptions/HeadlessApiDescription'
import { objectFields } from './descriptions/ObjectDescription'
import { executeFunction, getRequestParameters } from './functions/GenericFunctions'
import { getHeadlessApiApplications, getHeadlessApiEndpoints, getHeadlessApiMethods } from './functions/HeadlessApiFunctions'
import { getObjectDefinitions, getObjectOperations } from './functions/ObjectFunctions'
import { OpenApiSpec } from './types/OpenApi'

export let openApiSpec: OpenApiSpec

export class Liferay implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Liferay',
		name: 'liferay',
		icon: 'file:liferay.svg',
		group: ['transform'],
		version: 1,
		description: 'Liferay',
		defaults: {
			name: 'Liferay'
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'oAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2Api']
					}
				}
			},
			{
				name: 'httpBasicAuth',
				required: true,
				displayOptions: {
					show: {
						authentication: ['httpBasicAuth']
					}
				}
			}
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'Basic Auth',
						value: 'httpBasicAuth'
					},
					{
						name: 'OAuth2',
						value: 'oAuth2Api'
					}
				],
				required: true,
				default: 'httpBasicAuth',
				description: 'The way to authenticate with Liferay'
			},
			{
				displayName: 'Liferay Base URL',
				name: 'baseUrl',
				type: 'string',
				required: true,
				default: 'http://localhost:8080'
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'Headless API Endpoint',
						value: 'headlessApi'
					},
					{
						name: 'Object Operation',
						value: 'objectOperation'
					}
				],
				required: true,
				default: '',
				noDataExpression: true
			},
			...objectFields,
			...headlessApiFields
		]
	}
	methods = {
		loadOptions: {
			getHeadlessApiApplications,
			getHeadlessApiEndpoints,
			getHeadlessApiMethods,
			getObjectDefinitions,
			getObjectOperations
		},
		resourceMapping: {
			getRequestParameters
		}
	}
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return executeFunction.call(this)
	}
}
