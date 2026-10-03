import serverless from "serverless-http";
import { app, ensureDatabase } from "../../server.js";

const expressHandler = serverless(app);
const functionPrefix = "/.netlify/functions/api";

const normalizePath = (event) => {
  const sourcePath =
    event.path ??
    (event.rawUrl
      ? new URL(event.rawUrl).pathname
      : event.rawPath ?? "/");
  if (sourcePath === functionPrefix) return "/api";
  if (sourcePath.startsWith(`${functionPrefix}/`)) {
    return `/api${sourcePath.slice(functionPrefix.length)}`;
  }
  return sourcePath;
};

export const handler = async (event, context) => {
  const requestPath = normalizePath(event);
  if (
    /^\/api\/(?:launch-ready|assets(?:\/|$)|token-launches(?:\/|$)|user-launches$)/.test(
      requestPath,
    )
  ) {
    await ensureDatabase();
  }
  const normalizedEvent = {
    ...event,
    version: undefined,
    path: requestPath,
    httpMethod: event.httpMethod ?? event.method ?? "GET",
    headers: event.headers ?? {},
    body: event.body ?? "",
    requestContext: {
      ...event.requestContext,
      identity: {
        ...event.requestContext?.identity,
        sourceIp:
          event.requestContext?.identity?.sourceIp ??
          event.requestContext?.http?.sourceIp ??
          "",
      },
    },
  };

  return expressHandler(normalizedEvent, context);
};
