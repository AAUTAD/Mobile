import { NextResponse } from 'next/server'
import { api } from '~/trpc/server'

export async function GET() {
    // Get list of news from trpc
    const news = await api.news.getAll()

    return NextResponse.json(news)
}