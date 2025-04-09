export type OpenApiBase = {
	[path: string]: string[]
}
export type OpenApiSpec = {
	paths: {
		[path: string]: {
			[method: string]: {
				operationId: string
				parameters: OpenApiSpecMethodParameter[]
			}
		}
	}
}
export type OpenApiSpecMethodParameter = {
	name: string
	in: 'header' | 'query' | 'path'
	required?: boolean
	schema: {
		type: string
	}
}
