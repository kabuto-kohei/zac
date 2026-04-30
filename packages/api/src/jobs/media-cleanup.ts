import { processPendingMediaDeletionJobs } from "../services/media-service.js";

const limit = Number.parseInt(process.env.MEDIA_CLEANUP_LIMIT ?? "25", 10);
const result = await processPendingMediaDeletionJobs(limit);

console.log(`media cleanup scanned=${result.scanned} deleted=${result.deleted} failed=${result.failed}`);
