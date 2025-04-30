import { authRouter} from "~/server/api/routers/auth";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { partnersRouter } from "./routers/partners";
import { tagsRouter } from "./routers/tags";
import { membersRouter } from "./routers/members";
import { eventsRouter } from "./routers/events";
import { newsRouter } from "./routers/news";
import { desportoRouter } from "./routers/desporto";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  partners: partnersRouter,
  tags: tagsRouter,
  members: membersRouter,
  events: eventsRouter,
  news: newsRouter,
  desporto: desportoRouter, // New router added here
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
