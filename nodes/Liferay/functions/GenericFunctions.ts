import {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	JsonObject,
	NodeApiError,
	ResourceMapperField,
	ResourceMapperFields,
	ResourceMapperValue
} from 'n8n-workflow'
import { OpenApiSpec, OpenApiSpecMethodParameter } from '../types/OpenApi'
import { headlessOpenApiSpec } from './HeadlessApiFunctions'
import { objectOpenApiSpec } from './ObjectFunctions'

export async function apiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	url: string,
	query: IDataObject = {},
	body: object = {}
): Promise<any> {
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
	const credentialsType: string = this.getNodeParameter('authentication', 0) as string
	const credentials = await this.getCredentials(credentialsType)
	try {
		if (credentialsType === 'httpBasicAuth') {
			options.auth = {
				password: credentials.password as string,
				username: credentials.user as string
			}
			return await this.helpers.httpRequestWithAuthentication.call(this, credentialsType, options)
		} else if (credentialsType === 'oAuth2Api') {
			return await this.helpers.requestOAuth2.call(this, 'oAuth2Api', options, {
				tokenType: 'Bearer'
			})
		}
	} catch (error) {
		console.log(error)
		if (error instanceof NodeApiError) {
			throw error
		}
		throw new NodeApiError(this.getNode(), error as JsonObject)
	}
}

export function getOpenApiMethodParameters(openApiSpec: OpenApiSpec, method: string, path: string): OpenApiSpecMethodParameter[] {
	method = method.toLowerCase()
	if (
		typeof openApiSpec.paths !== 'object' ||
		typeof openApiSpec.paths[path] !== 'object' ||
		typeof openApiSpec.paths[path][method] !== 'object' ||
		typeof openApiSpec.paths[path][method].parameters !== 'object'
	) {
		throw new Error('Error getting parameters from OpenAPI JSON for method ' + method + ' on path ' + path + '.')
	}
	return openApiSpec.paths[path][method].parameters
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
	let fields: ResourceMapperField[] = []
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
	const baseUrl: string = this.getNodeParameter('baseUrl', 0) as string
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
			body = this.getNodeParameter('objectBody', 0) as object
		} catch (e) {}
	} else if (type === 'headlessApi') {
		openApiSpec = headlessOpenApiSpec
		const headlessApiApplication: string = this.getNodeParameter('headlessApiApplication', 0) as string
		path = this.getNodeParameter('headlessApiEndpoint', 0) as string
		let pathArray: string[] = path.split('/')
		pathArray.shift()
		pathArray.shift()
		url = headlessApiApplication.replace('/openapi.json', '') + '/' + pathArray.join('/')
		method = this.getNodeParameter('headlessApiMethod', 0) as string
		requestParameters = this.getNodeParameter('headlessApiParameters', 0) as ResourceMapperValue
		try {
			body = this.getNodeParameter('headlessApiBody', 0) as object
		} catch (e) {}
	}
	const openApiMethodParameters = getOpenApiMethodParameters(openApiSpec!, method, path)
	let query: IDataObject = {}
	for (const key in requestParameters!.value) {
		const openApiMethodParameter = openApiMethodParameters.find((p: OpenApiSpecMethodParameter) => p.name === key)
		if (!openApiMethodParameter) continue
		if (openApiMethodParameter.in === 'path') {
			url = url.replace('{' + key + '}', requestParameters!.value[key] as string)
		} else if (openApiMethodParameter.in === 'query') {
			query[key] = requestParameters!.value[key]
		}
	}
	const response = await apiRequest.call(this, method.toUpperCase() as IHttpRequestMethods, url, query, body)
	return [[{ json: response }]]
}
