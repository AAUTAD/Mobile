import Link from "next/link";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  console.log("session", session);

  return (
    <HydrateClient>
      <main className="flex">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
              <a href="aautad://">Abrir app</a>
              <a href="aautad://member?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXR1cm5PYmplY3QiOnsiZW1haWwiOiJqb3RhZmUzMkBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJKb2FvIiwibGFzdE5hbWUiOiJBemV2ZWRvIiwibWVtYmVySWQiOiIxIiwidmVyaWZpY2F0aW9uX3Rva2VuIjoiNjA0MmI0MTgtNzA1OC00YzE4LWI4N2YtZGZjYjI3OTlkOTIwIiwibmV4dFBheW1lbnQiOiIyMDI2LTAyLTEwVDAwOjAwOjAwLjAwMFoifSwiaWF0IjoxNzM5Mjk2MTYxLCJleHAiOjMzMTI0NzM0MjEzfQ.r3tR1zrEmoAbvr1f5uKB5qHGo1SGy9PYPkocq6EV6oU">Token</a>
            </div>
          </div>

        </div>
      </main>
    </HydrateClient>
  );
}
