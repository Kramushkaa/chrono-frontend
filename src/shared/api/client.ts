import { apiData, apiJson } from './core'

type Primitive = string | number | boolean

export interface ApiClientOptions {
  basePath?: string
  defaultHeaders?: Record<string, string>
}

export interface ApiClient {
  get<T>(path: string, init?: RequestInit): Promise<T>
  getJson<T>(path: string, init?: RequestInit): Promise<T>
  post<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T>
  patch<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T>
  put<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T>
  delete<T>(path: string, init?: RequestInit): Promise<T>
}

const toRecord = (headers?: HeadersInit): Record<string, string> => {
  if (!headers) return {}
  if (headers instanceof Headers) {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }
  if (Array.isArray(headers)) {
    return headers.reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
  }
  return { ...headers }
}

const ensureJsonHeaders = (headers: Record<string, string>) => {
  const hasContentType = Object.keys(headers).some(key => key.toLowerCase() === 'content-type')
  if (!hasContentType) {
    headers['Content-Type'] = 'application/json'
  }
  return headers
}

export const createApiClient = (options: ApiClientOptions = {}): ApiClient => {
  const basePath = options.basePath ?? ''

  const buildPath = (path: string) => {
    if (!basePath) {
      return path || ''
    }
    if (!path || path === '/') {
      return basePath
    }
    if (path.startsWith('?')) {
      return `${basePath}${path}`
    }
    return path.startsWith('/') ? `${basePath}${path}` : `${basePath}/${path}`
  }

  const mergeHeaders = (headers?: HeadersInit) => ({
    ...(options.defaultHeaders ?? {}),
    ...toRecord(headers),
  })

  const callApiData = <T>(path: string, init?: RequestInit) => {
    return init ? apiData<T>(path, init) : apiData<T>(path)
  }

  const callApiJson = <T>(path: string, init?: RequestInit) => {
    return init ? apiJson<T>(path, init) : apiJson<T>(path)
  }

  const withBody = <B>(
    method: string,
    body: B | undefined,
    init?: RequestInit,
    json = true
  ): RequestInit => {
    const mergedHeaders = mergeHeaders(init?.headers)
    const hasHeaders = Object.keys(mergedHeaders).length > 0
    const nextInit: RequestInit = {
      ...init,
      method,
    }

    if (body !== undefined) {
      const headers = json ? ensureJsonHeaders({ ...mergedHeaders }) : mergedHeaders
      nextInit.headers = headers
      nextInit.body = json ? JSON.stringify(body) : (body as unknown as BodyInit)
    } else if (hasHeaders) {
      nextInit.headers = mergedHeaders
    }

    if (body === undefined && !init?.body) {
      delete nextInit.body
    }
    if (!nextInit.headers || Object.keys(nextInit.headers as Record<string, string>).length === 0) {
      delete nextInit.headers
    }

    return nextInit
  }

  return {
    get: <T>(path: string, init?: RequestInit) => callApiData<T>(buildPath(path), init),
    getJson: <T>(path: string, init?: RequestInit) => callApiJson<T>(buildPath(path), init),
    post: <T, B = unknown>(path: string, body?: B, init?: RequestInit) =>
      callApiData<T>(buildPath(path), withBody('POST', body, init)),
    patch: <T, B = unknown>(path: string, body?: B, init?: RequestInit) =>
      callApiData<T>(buildPath(path), withBody('PATCH', body, init)),
    put: <T, B = unknown>(path: string, body?: B, init?: RequestInit) =>
      callApiData<T>(buildPath(path), withBody('PUT', body, init)),
    delete: <T>(path: string, init?: RequestInit) => {
      const headers = mergeHeaders(init?.headers)
      const request: RequestInit = {
        ...init,
        method: 'DELETE',
      }
      if (Object.keys(headers).length > 0) {
        request.headers = headers
      }
      return callApiData<T>(buildPath(path), request)
    },
  }
}

export const buildQueryString = (filters: Record<string, Primitive | Primitive[] | null | undefined>): string => {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      params.append(key, value.join(','))
    } else {
      params.append(key, String(value))
    }
  })
  return params.toString()
}
