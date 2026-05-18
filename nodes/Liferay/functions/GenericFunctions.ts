import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	IWebhookFunctions,
	JsonObject,
	LoggerProxy as Logger,
	NodeApiError,
	ResourceMapperField,
	ResourceMapperFields,
	ResourceMapperValue
} from 'n8n-workflow'
import { LiferayApiResponse } from '../types/ObjectTypes'
import { OpenApiSpec, OpenApiSpecMethodParameter } from '../types/OpenApi'
import { headlessOpenApiSpec } from './HeadlessApiFunctions'
import { objectOpenApiSpec } from './ObjectFunctions'

export async function apiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	url: string,
	query: IDataObject = {},
	body: object = {}
): Promise<LiferayApiResponse | OpenApiSpec | undefined> {
	const options: IHttpRequestOptions = {
		method,
		url: url,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body,
		qs: query,
		json: true
	}
	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, this.getNodeParameter('authentication', 0) as string, options)
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject)
	}
	return
}

export async function getBaseUrl(this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions): Promise<string> {
	const credentialsType: string = this.getNodeParameter('authentication', 0) as string
	const credentials = await this.getCredentials(credentialsType)
	return credentialsType === 'liferayOAuth2Api' ? new URL(credentials.accessTokenUrl as string).origin : (credentials.baseUrl as string)
}

export function getOpenApiMethodParameters(openApiSpec: OpenApiSpec, method: string, path: string): OpenApiSpecMethodParameter[] {
	method = method.toLowerCase()
	if (
		typeof openApiSpec === 'object' &&
		typeof openApiSpec.paths === 'object' &&
		typeof openApiSpec.paths[path] === 'object' &&
		typeof openApiSpec.paths[path][method] === 'object' &&
		typeof openApiSpec.paths[path][method].parameters === 'object'
	) {
		return openApiSpec.paths[path][method].parameters
	}
	return []
}

export async function getRequestParameters(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {
	const type: string = this.getNodeParameter('type', 0) as string
	const openApiSpec: OpenApiSpec = type === 'objectOperation' ? objectOpenApiSpec : headlessOpenApiSpec
	if (!openApiSpec) return { fields: [] }
	let [method, path]: string = ''
	if (type === 'objectOperation') {
		const objectOperation: string = this.getCurrentNodeParameter('objectOperation') as string
		;[method, path] = objectOperation.split('|')
	} else if (type === 'headlessApi') {
		method = this.getCurrentNodeParameter('headlessApiMethod') as string
		path = this.getCurrentNodeParameter('headlessApiEndpoint') as string
	}
	const openApiMethodParameters = getOpenApiMethodParameters(openApiSpec, method, path)
	const fields: ResourceMapperField[] = []
	openApiMethodParameters.forEach((parameter: OpenApiSpecMethodParameter) => {
		fields.push({
			id: parameter.name,
			displayName: parameter.name,
			required: parameter.required || false,
			display: true,
			defaultMatch: false
		})
	})
	return { fields: fields }
}

export async function executeFunction(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const type: string = this.getNodeParameter('type', 0) as string
	const baseUrl: string = await getBaseUrl.call(this)
	let openApiSpec: OpenApiSpec
	let [method, path, url]: string = ''
	let requestParameters: ResourceMapperValue
	let body = {}
	if (type === 'objectOperation') {
		openApiSpec = objectOpenApiSpec
		const restContextPath: string = this.getNodeParameter('objectDefinition', 0) as string
		const objectOperation = this.getNodeParameter('objectOperation', 0) as string
		;[method, path] = objectOperation.split('|')
		url = baseUrl + restContextPath + path
		requestParameters = this.getNodeParameter('objectParameters', 0) as ResourceMapperValue
		try {
			body = this.getNodeParameter('objectBody', 0, {}) as object
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject)
		}
	} else if (type === 'headlessApi') {
		openApiSpec = headlessOpenApiSpec
		const headlessApiApplication: string = this.getNodeParameter('headlessApiApplication', 0) as string
		path = this.getNodeParameter('headlessApiEndpoint', 0) as string
		const pathArray: string[] = path.split('/')
		pathArray.shift()
		pathArray.shift()
		url = headlessApiApplication.replace('/openapi.json', '') + '/' + pathArray.join('/')
		method = this.getNodeParameter('headlessApiMethod', 0) as string
		requestParameters = this.getNodeParameter('headlessApiParameters', 0) as ResourceMapperValue
		Logger.debug(JSON.stringify(requestParameters))
		try {
			body = this.getNodeParameter('headlessApiBody', 0, {}) as object
		} catch (error) {
			throw new NodeApiError(this.getNode(), error as JsonObject)
		}
	}
	const openApiMethodParameters = getOpenApiMethodParameters(openApiSpec!, method, path)
	const query: IDataObject = {}
	for (const key in requestParameters!.value) {
		const openApiMethodParameter = openApiMethodParameters.find((p: OpenApiSpecMethodParameter) => p.name === key)
		if (!openApiMethodParameter) continue
		if (openApiMethodParameter.in === 'path') {
			url = url.replace('{' + key + '}', requestParameters!.value[key] as string)
		} else if (openApiMethodParameter.in === 'query') {
			query[key] = requestParameters!.value[key]
		}
	}
	const response = (await apiRequest.call(this, method.toUpperCase() as IHttpRequestMethods, url, query, body)) as IDataObject
	return [[{ json: response, pairedItem: { item: 0 } }]]
}

export async function getOAuthAccessToken(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions | IWebhookFunctions
): Promise<{ access_token: string }> {
	const credentials = await this.getCredentials('liferayOAuth2Api')
	const options: IHttpRequestOptions = {
		headers: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		method: 'POST',
		qs: {
			client_id: credentials.clientId,
			client_secret: credentials.clientSecret,
			grant_type: 'client_credentials'
		},
		url: credentials.accessTokenUrl as string,
		json: true
	}
	try {
		return await this.helpers.httpRequest.call(this, options)
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject)
	}
}
