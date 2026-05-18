import type { IAuthenticateGeneric, Icon, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow'

export class LiferayBasicAuthApi implements ICredentialType {
	name = 'liferayBasicAuthApi'
	extends = ['httpBasicAuth']
	displayName = 'Liferay Basic Auth API'
	documentationUrl = 'https://github.com/ChrisHof/n8n-nodes-liferay'
	icon: Icon = 'file:../nodes/Liferay/liferay.svg'
	properties: INodeProperties[] = [
		{
			displayName: 'Liferay Base URL',
			name: 'baseUrl',
			type: 'string',
			required: true,
			default: 'http://localhost:8080'
		},
		{
			displayName: 'User',
			name: 'user',
			type: 'string',
			required: true,
			default: ''
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true
			},
			required: true,
			default: 'test'
		}
	]
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.user}}',
				password: '={{$credentials.password}}'
			}
		}
	}
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ $credentials.baseUrl }}',
			url: '/o/headless-admin-user/v1.0/my-user-account'
		}
	}
}
