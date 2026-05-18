import type { INodeProperties } from 'n8n-workflow'

export const objectFields: INodeProperties[] = [
	{
		displayName: 'Object Definition Name or ID',
		name: 'objectDefinition',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		required: true,
		default: '',
		placeholder: 'The Object Definition to use...',
		displayOptions: {
			show: {
				authentication: [{ _cnd: { not: '' } }],
				type: ['objectOperation']
			}
		},
		typeOptions: {
			loadOptionsDependsOn: ['authentication', 'type'],
			loadOptionsMethod: 'getObjectDefinitions'
		}
	},
	{
		displayName: 'Operation Name or ID',
		name: 'objectOperation',
		type: 'options',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		required: true,
		default: '',
		placeholder: 'The operation to call...',
		displayOptions: {
			show: {
				authentication: [{ _cnd: { not: '' } }],
				objectDefinition: [{ _cnd: { not: '' } }],
				type: ['objectOperation']
			}
		},
		typeOptions: {
			loadOptionsDependsOn: ['authentication', 'type', 'objectDefinition'],
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
				authentication: [{ _cnd: { not: '' } }],
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
				authentication: [{ _cnd: { not: '' } }],
				objectOperation: [{ _cnd: { regex: '^PATCH|POST|PUT' } }],
				type: ['objectOperation']
			}
		}
	}
]
