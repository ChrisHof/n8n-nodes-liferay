import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeApiError, NodeConnectionTypes } from 'n8n-workflow'
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
		subtitle: '',
		defaults: {
			name: 'Liferay'
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'liferayOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['liferayOAuth2Api']
					}
				}
			},
			{
				name: 'liferayBasicAuthApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['liferayBasicAuthApi']
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
						value: 'liferayBasicAuthApi'
					},
					{
						name: 'OAuth2',
						value: 'liferayOAuth2Api'
					}
				],
				default: 'liferayOAuth2Api',
				description: 'Way to authenticate with Liferay'
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
				default: 'headlessApi',
				noDataExpression: true,
				displayOptions: {
					show: {
						authentication: [{ _cnd: { not: '' } }]
					}
				}
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
		try {
			return executeFunction.call(this)
		} catch (error) {
			if (this.continueOnFail()) {
				return []
			} else {
				throw new NodeApiError(this.getNode(), error)
			}
		}
	}
}
