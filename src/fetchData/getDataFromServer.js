import { server } from '../config.json'

const { host, port } = server

export default async (endpoint) => {
  console.log('getting data from server:', endpoint)

  try {
    const response = await fetch(`//${host}:${port}/${endpoint}.json`)
    if (!response.ok) {
      throw new Error(`failed to fetch data: ${endpoint}`)
    }
    return await response.json()
  } catch (err) {
    console.error(err)
    return null
  }
}
