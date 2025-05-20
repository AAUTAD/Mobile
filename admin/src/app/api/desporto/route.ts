import { NextResponse } from 'next/server'
import { api } from '~/trpc/server'

export async function GET() {
    // Get list of sports from trpc router, ensuring persons are included
    const sports = await api.sport.getAll() // Assuming your sport.getAll includes persons

    return NextResponse.json(sports)
}
