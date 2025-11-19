// Cloudflare D1 database client
// This will be used to interact with the D1 database

export interface D1Database {
  prepare(query: string): D1PreparedStatement
  dump(): Promise<ArrayBuffer>
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>
  exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(colName?: string): Promise<T | null>
  run<T = unknown>(): Promise<D1Result<T>>
  all<T = unknown>(): Promise<D1Result<T>>
  raw<T = unknown>(): Promise<T[]>
}

export interface D1Result<T = unknown> {
  results?: T[]
  success: boolean
  error?: string
  meta: {
    duration: number
    size_after: number
    rows_read: number
    rows_written: number
  }
}

export interface D1ExecResult {
  count: number
  duration: number
}

// Helper function to get DB instance
// In production, this would be passed from the Cloudflare Worker context
export function getDB(): D1Database | null {
  // For now, return null - this will be replaced with actual D1 binding
  // when deployed to Cloudflare Workers
  if (typeof process !== 'undefined' && process.env.DB) {
    return process.env.DB as unknown as D1Database
  }
  return null
}
