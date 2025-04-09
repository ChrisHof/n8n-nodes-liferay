import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import n8nNodesBase from 'eslint-plugin-n8n-nodes-base'
import { defineConfig } from 'eslint/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
})

export default defineConfig([
	{
		extends: compat.extends('./eslint.config.mjs')
	},
	{
		files: ['**/package.json'],

		plugins: {
			'n8n-nodes-base': n8nNodesBase
		},

		rules: {
			'n8n-nodes-base/community-package-json-name-still-default': 'error'
		}
	}
])
