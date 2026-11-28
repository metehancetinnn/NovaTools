import { handleRetired } from '../../../src/server/http/retired-routes.mjs';

// 410 Gone for articles about the tools retired on 2026-11-27; everything else is served as before.
export const onRequest = handleRetired;
