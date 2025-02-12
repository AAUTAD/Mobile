import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { api } from '~/trpc/server';
import { sendEmail } from '~/lib/email';
import crypto from 'crypto';
import { CardStatus, Member, PaymentStatus } from '~/types/member';
import jwt from 'jsonwebtoken';
import { memberSchema } from '~/schemas/member-schema';

// Function gets email and verification_token from request body
// Sends an email with a token if the member exists
export async function POST(req: Request, res: NextApiResponse) {
    const data = await req.json()
    const { email, verification_token } = data;


    // Check if member exists
    const member = await api.members.getByEmail(email);

    // If member exists, send email with token
    if (member && member.nextPayment) { // remember to check for && member.cardStatus === CardStatus.active
        // Generate token with verification_token as secret 
        const returnObject = {
            email: email,
            firstName: member.firstName,
            lastName: member.lastName,
            memberId: member.memberId,
            verification_token: verification_token,
            nextPayment: member.nextPayment,
        }
        const expiresIn = member.nextPayment ? new Date(member.nextPayment).getTime() - Date.now() : 0;
        const token = jwt.sign({ returnObject }, verification_token, { expiresIn });

        // Send email with token
        const encodedToken = encodeURIComponent(token);
        console.log("Encoded URL:", `aautad://member?token=${encodedToken}`);

        // await sendEmail(email, 'Verification Token', `` ,`
        //     <p>Your verification token is:</p>
        //     <a href="aautad://?token=${encodedToken}">
        //         <button>Verify</button>
        //     </a>
        // `);

        console.log(`aautad://?token=${encodedToken}`);
        // await sendEmail(email, verification_token);

        const zodMember = memberSchema.parse(member);

        const result = await api.members.createAccess({ member: zodMember, token: token, verification_token: verification_token });

        return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
