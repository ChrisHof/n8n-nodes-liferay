import { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow'
import { LiferayObjectDefinition } from '../types/ObjectTypes'
import { OpenApiSpec } from '../types/OpenApi'
import { apiRequest } from './GenericFunctions'

export let objectOpenApiSpec: OpenApiSpec

export async function getObjectDefinitions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const baseUrl: string = this.getCurrentNodeParameter('baseUrl') as string
	let query: IDataObject = {
		sort: 'name',
		pageSize: 666
	}
	const response = await apiRequest.call(this, 'GET', baseUrl + '/o/object-admin/v1.0/object-definitions', query)
	if (typeof response.items !== 'object') {
		console.log(response)
		throw new Error('Invalid JSON')
	}
	let definitions: INodePropertyOptions[] = []
	const items: LiferayObjectDefinition[] = response.items
	items.map((item: LiferayObjectDefinition) => {
		if (item.status.code === 0 && item.system === false) {
			definitions.push({
				name: item.name,
				value: item.restContextPath
			})
		}
	})
	return await definitions
}

export async function getObjectOperations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const baseUrl: string = this.getCurrentNodeParameter('baseUrl') as string
	const restContextPath: string = this.getCurrentNodeParameter('objectDefinition') as string
	const restUrl: string = baseUrl + restContextPath
	const response = await apiRequest.call(this, 'GET', restUrl + '/openapi.json')
	if (typeof response.paths !== 'object') {
		console.log(response)
		throw new Error('Invalid JSON')
	}
	objectOpenApiSpec = response
	let endpoints: INodePropertyOptions[] = []
	for (const path in objectOpenApiSpec.paths) {
		if (path.indexOf('openapi') > -1) {
			continue
		}
		for (const method in objectOpenApiSpec.paths[path]) {
			endpoints.push({
				name: objectOpenApiSpec.paths[path][method].operationId,
				value: method.toUpperCase() + '|' + path
			})
		}
	}
	endpoints.sort((a, b) => (a.name > b.name ? 1 : -1))
	return endpoints
}
