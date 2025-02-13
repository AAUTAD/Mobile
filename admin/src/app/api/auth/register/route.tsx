import { NextResponse } from "next/server";

export const POST = async () => {
    // send mutation to tRPC
    return NextResponse.json({ success: true }, { status: 200 });
};