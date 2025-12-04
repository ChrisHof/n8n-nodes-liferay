import type { INodeProperties } from 'n8n-workflow'

export const objectFields: INodeProperties[] = [
	{
		displayName: 'Object Definition',
		name: 'objectDefinition',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		required: true,
		default: '',
		placeholder: 'The Object Definition to use...',
		displayOptions: {
			show: {
				baseUrl: [{ _cnd: { not: '' } }],
				type: ['objectOperation']
			}
		},
		typeOptions: {
			loadOptionsDependsOn: ['baseUrl', 'type'],
			loadOptionsMethod: 'getObjectDefinitions'
		}
	},
	{
		displayName: 'Operation',
		name: 'objectOperation',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		required: true,
		default: '',
		placeholder: 'The operation to call...',
		displayOptions: {
			show: {
				baseUrl: [{ _cnd: { not: '' } }],
				objectDefinition: [{ _cnd: { not: '' } }],
				type: ['objectOperation']
			}
		},
		typeOptions: {
			loadOptionsDependsOn: ['baseUrl', 'type', 'objectDefinition'],
			loadOptionsMethod: 'getObjectOperations'
		}
	},
	{
		displayName: 'Parameters',
		name: 'objectParameters',
		type: 'resourceMapper',
		default: {
			mappingMode: 'defineBelow',
			value: null
		},
		noDataExpression: true,
		typeOptions: {
			loadOptionsDependsOn: ['objectDefinition', 'objectOperation'],
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
				objectDefinition: [{ _cnd: { not: '' } }],
				objectOperation: [{ _cnd: { not: '' } }],
				type: ['objectOperation']
			}
		}
	},
	{
		displayName: 'Body',
		name: 'objectBody',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				baseUrl: [{ _cnd: { not: '' } }],
				objectOperation: [{ _cnd: { regex: '^PATCH|POST|PUT' } }],
				type: ['objectOperation']
			}
		}
	}
]
