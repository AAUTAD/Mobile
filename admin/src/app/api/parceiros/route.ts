import { NextResponse } from 'next/server'
import { api } from '~/trpc/server'

export async function GET() {
  // Get list of partners from trpc
  const partners = await api.partners.getAll()

  return NextResponse.json(partners)
}