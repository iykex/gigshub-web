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
// In Cloudflare Workers/Pages, the D1 binding is available on the env object
// In local development with wrangler, it's available on the request context
export function getDB(env?: any): D1Database | null {
  // If env is passed (from API routes or server components), use it
  if (env?.DB) {
    return env.DB as D1Database
  }

  // Fallback for other contexts
  if (typeof process !== 'undefined' && process.env.DB) {
    return process.env.DB as unknown as D1Database
  }

  // Local development fallback using better-sqlite3
  if (process.env.NODE_ENV === 'development') {
    try {
      const path = require('path')
      const Database = require('better-sqlite3')

      // Try to find the local D1 file
      // This path might need adjustment based on your specific setup
      const dbPath = path.resolve(process.cwd(), '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/ae610cd37aebf51439f4d2f53a440c4cb6d1eb63cd18b3b251b21503c44a5c12.sqlite')

      return new LocalD1Database(dbPath)
    } catch (e) {
      console.error('Failed to initialize local D1 adapter:', e)
    }
  }

  return null
}

// Local D1 Adapter for development
class LocalD1Database implements D1Database {
  private db: any

  constructor(dbPath: string) {
    const Database = require('better-sqlite3')
    this.db = new Database(dbPath)
  }

  prepare(query: string): D1PreparedStatement {
    const stmt = this.db.prepare(query)
    return new LocalD1PreparedStatement(stmt)
  }

  async dump(): Promise<ArrayBuffer> {
    throw new Error('Not implemented in local adapter')
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    throw new Error('Not implemented in local adapter')
  }

  async exec(query: string): Promise<D1ExecResult> {
    const info = this.db.exec(query)
    return { count: 0, duration: 0 }
  }
}

class LocalD1PreparedStatement implements D1PreparedStatement {
  private stmt: any
  private bindings: any[] = []

  constructor(stmt: any) {
    this.stmt = stmt
  }

  bind(...values: unknown[]): D1PreparedStatement {
    this.bindings = values
    return this
  }

  async first<T = unknown>(colName?: string): Promise<T | null> {
    try {
      const result = this.stmt.get(...this.bindings)
      if (!result) return null
      if (colName) return result[colName] as T
      return result as T
    } catch (e) {
      console.error('Error in first():', e)
      return null
    }
  }

  async run<T = unknown>(): Promise<D1Result<T>> {
    try {
      const info = this.stmt.run(...this.bindings)
      return {
        success: true,
        meta: {
          duration: 0,
          size_after: 0,
          rows_read: 0,
          rows_written: info.changes
        }
      }
    } catch (e: any) {
      return {
        success: false,
        error: e.message,
        meta: { duration: 0, size_after: 0, rows_read: 0, rows_written: 0 }
      }
    }
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    try {
      const results = this.stmt.all(...this.bindings)
      return {
        results: results as T[],
        success: true,
        meta: {
          duration: 0,
          size_after: 0,
          rows_read: results.length,
          rows_written: 0
        }
      }
    } catch (e: any) {
      return {
        success: false,
        error: e.message,
        meta: { duration: 0, size_after: 0, rows_read: 0, rows_written: 0 }
      }
    }
  }

  async raw<T = unknown>(): Promise<T[]> {
    const results = this.stmt.raw().all(...this.bindings)
    return results as T[]
  }
}

// Database helper functions
export async function getAllPricing(db: D1Database) {
  const result = await db.prepare(
    'SELECT * FROM pricing WHERE is_active = 1 ORDER BY provider, CAST(REPLACE(size, "GB", "") AS REAL)'
  ).all()
  return result.results
}

export async function getPricingByProvider(db: D1Database, provider: string) {
  const result = await db.prepare(
    'SELECT * FROM pricing WHERE provider = ? AND is_active = 1 ORDER BY CAST(REPLACE(size, "GB", "") AS REAL)'
  ).bind(provider).all()
  return result.results
}

export async function getPricingById(db: D1Database, id: number) {
  const result = await db.prepare(
    'SELECT * FROM pricing WHERE id = ? AND is_active = 1'
  ).bind(id).first()
  return result
}

export async function getProviders(db: D1Database) {
  const result = await db.prepare(
    'SELECT DISTINCT provider FROM pricing WHERE is_active = 1 ORDER BY provider'
  ).all()
  return result.results?.map((r: any) => r.provider) || []
}
