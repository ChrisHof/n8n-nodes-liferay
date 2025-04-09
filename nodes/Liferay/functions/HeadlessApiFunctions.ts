import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow'
import { OpenApiBase, OpenApiSpec } from '../types/OpenApi'
import { apiRequest } from './GenericFunctions'

export let headlessOpenApiSpec: OpenApiSpec

export async function getHeadlessApiApplications(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const baseUrl: string = this.getCurrentNodeParameter('baseUrl') as string
	const response = await apiRequest.call(this, 'GET', baseUrl + '/o/openapi')
	if (typeof response !== 'object') {
		console.log(response)
		throw new Error('Invalid OpenAPI JSON')
	}
	let basePaths: INodePropertyOptions[] = []
	const openApiBase: OpenApiBase = response
	for (const key in openApiBase) {
		const url: string = openApiBase[key][0].replace('openapi.yaml', 'openapi.json')
		basePaths.push({
			name: url.substring(url.indexOf('/o/') + 3).replace('/openapi.json', ''),
			value: url
		})
	}
	basePaths.sort((a, b) => (a.name > b.name ? 1 : -1))
	return await basePaths
}

export async function getHeadlessApiEndpoints(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const headlessApiApplication: string = this.getCurrentNodeParameter('headlessApiApplication') as string
	const response = await apiRequest.call(this, 'GET', headlessApiApplication)
	if (typeof response.paths !== 'object') {
		console.log(response)
		throw new Error('Invalid OpenAPI JSON')
	}
	headlessOpenApiSpec = response
	let endpoints: INodePropertyOptions[] = []
	for (let path in headlessOpenApiSpec.paths) {
		if (path.startsWith('/openapi')) continue
		endpoints.push({
			name: path,
			value: path
		})
	}
	endpoints.sort((a, b) => (a.name > b.name ? 1 : -1))
	return await endpoints
}

export async function getHeadlessApiMethods(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	let methods: INodePropertyOptions[] = []
	if (typeof headlessOpenApiSpec === 'object' && typeof headlessOpenApiSpec.paths === 'object') {
		Object.keys(headlessOpenApiSpec.paths[this.getCurrentNodeParameter('headlessApiEndpoint') as string]).forEach((key) => {
			methods.push({
				name: key.toUpperCase(),
				value: key.toUpperCase()
			})
		})
		methods.sort((a, b) => (a.name > b.name ? 1 : -1))
	}
	return await methods
}
