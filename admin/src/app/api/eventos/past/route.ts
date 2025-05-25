import { NextResponse } from 'next/server'
import { api } from '~/trpc/server'

export async function GET() {
    // Get list of past events from trpc
    const events = await api.events.getPast()

    return NextResponse.json(events)
}
