import type { Icon, ICredentialType, INodeProperties } from 'n8n-workflow'

export class LiferayOAuth2Api implements ICredentialType {
	name = 'liferayOAuth2Api'
	extends = ['oAuth2Api']
	displayName = 'Liferay OAuth2 API'
	documentationUrl = 'https://github.com/ChrisHof/n8n-nodes-liferay'
	icon: Icon = 'file:../nodes/Liferay/liferay.svg'
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'clientCredentials'
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'string',
			default: 'http://localhost:8080/o/oauth2/token',
			required: true
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header'
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: ''
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: ''
		},
		{
			displayName: 'Allowed HTTP Request Domains',
			name: 'allowedHttpRequestDomains',
			type: 'hidden',
			default: 'all'
		}
	]
}
