import type { INodeProperties } from 'n8n-workflow'

export const headlessApiFields: INodeProperties[] = [
	{
		displayName: 'REST Application Name',
		name: 'headlessApiApplication',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		required: true,
		default: '',
		displayOptions: {
			show: {
				baseUrl: [{ _cnd: { not: '' } }],
				type: ['headlessApi']
			}
		},
		typeOptions: {
			loadOptionsDependsOn: ['baseUrl', 'type'],
			loadOptionsMethod: 'getHeadlessApiApplications'
		}
	},
	{
		displayName: 'Endpoint Name',
		name: 'headlessApiEndpoint',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		required: true,
		default: '',
		displayOptions: {
			show: {
				baseUrl: [{ _cnd: { not: '' } }],
				headlessApiApplication: [{ _cnd: { not: '' } }],
				type: ['headlessApi']
			}
		},
		typeOptions: {
			loadOptionsDependsOn: ['baseUrl', 'headlessApiApplication', 'type'],
			loadOptionsMethod: 'getHeadlessApiEndpoints'
		}
	},
	{
		displayName: 'Method',
		name: 'headlessApiMethod',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		required: true,
		default: '',
		displayOptions: {
			show: {
				baseUrl: [{ _cnd: { not: '' } }],
				headlessApiApplication: [{ _cnd: { not: '' } }],
				headlessApiEndpoint: [{ _cnd: { not: '' } }],
				type: ['headlessApi']
			}
		},
		typeOptions: {
			loadOptionsDependsOn: ['baseUrl', 'headlessApiApplication', 'headlessApiEndpoint', 'type'],
			loadOptionsMethod: 'getHeadlessApiMethods'
		}
	},
	{
		displayName: 'Parameters',
		name: 'headlessApiParameters',
		type: 'resourceMapper',
		default: {
			mappingMode: 'defineBelow',
			value: null
		},
		noDataExpression: true,
		typeOptions: {
			loadOptionsDependsOn: ['baseUrl', 'headlessApiEndpoint', 'headlessApiMethod', 'type'],
			resourceMapper: {
				resourceMapperMethod: 'getRequestParameters',
				mode: 'add',
				fieldWords: {
					singular: 'column',
					plural: 'columns'
				},
				addAllFields: true
			}
		},
		displayOptions: {
			show: {
				baseUrl: [{ _cnd: { not: '' } }],
				headlessApiEndpoint: [{ _cnd: { not: '' } }],
				headlessApiMethod: [{ _cnd: { not: '' } }],
				type: ['headlessApi']
			}
		}
	},
	{
		displayName: 'Body',
		name: 'headlessApiBody',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				baseUrl: [{ _cnd: { not: '' } }],
				headlessApiMethod: [{ _cnd: { regex: '^PATCH|POST|PUT' } }],
				type: ['headlessApi']
			}
		}
	}
]
