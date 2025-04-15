import { NextResponse } from 'next/server'
import { api } from '~/trpc/server'

export async function GET() {
    // Get list of upcoming events from trpc
    const events = await api.events.getUpcoming()

    return NextResponse.json(events)
}