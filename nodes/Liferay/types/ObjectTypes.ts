export type LiferayApiResponse = {
	items: LiferayObjectDefinition[]
	page: number
	pageSize: number
	totalCount: number
}

export type LiferayObjectDefinition = {
	name: string
	restContextPath: string
	status: {
		code: number
	}
	system: boolean
}
