import { build } from 'vite'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let apiArg = process.env.API_BASE_URL || ''
for (const a of process.argv.slice(2)) {
  if (a.startsWith('--api=')) {
    apiArg = a.slice(6)
  }
}
if (!apiArg) {
  console.error('Missing API base URL. Use: npm run build:api -- --api=https://your-api.example.com or set API_BASE_URL')
  process.exit(1)
}
process.env.VITE_API_BASE_URL = apiArg
process.env.NODE_ENV = 'production'

const run = async () => {
  await build({ root: dirname(__dirname) })
}
run().catch((err) => {
  console.error(err)
  process.exit(1)
})

