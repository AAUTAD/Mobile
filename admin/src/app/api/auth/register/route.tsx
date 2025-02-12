import type { NextApiRequest, NextApiResponse } from "next";
import { createTRPCContext } from "~/server/api/trpc";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
    ) {
        if(req.method === "POST") {
            // send mutation to tRPC


        } else {
            res.setHeader("Allow", ["POST"])
            res.status(405).end(`Method ${req.method} Not Allowed`)
        }
}