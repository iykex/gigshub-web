import { NextRequest, NextResponse } from 'next/server'
import { getDB, getAllPricing, getPricingByProvider } from '@/lib/db'

// export const runtime = 'edge' // Commented out for local dev with better-sqlite3

export async function GET(request: NextRequest) {
    try {
        // Get the D1 database instance from the environment
        // @ts-ignore - D1 binding is available in Cloudflare Workers environment
        const db = getDB(process.env)

        if (!db) {
            return NextResponse.json(
                { error: 'Database connection not available' },
                { status: 503 }
            )
        }

        // Get provider from query params if specified
        const { searchParams } = new URL(request.url)
        const provider = searchParams.get('provider')

        let pricing: any[] | undefined
        if (provider) {
            pricing = await getPricingByProvider(db, provider)
        } else {
            pricing = await getAllPricing(db)
        }

        return NextResponse.json({
            success: true,
            data: pricing,
            count: pricing?.length || 0
        })
    } catch (error) {
        console.error('Error fetching pricing:', error)
        return NextResponse.json(
            { error: 'Failed to fetch pricing data', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
