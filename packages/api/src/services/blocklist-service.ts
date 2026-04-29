import { and, blocks, eq } from "@zac/db";
import { getDatabase } from "../integrations/database.js";

export async function hasBlockBetween(userA: string | undefined, userB: string | undefined) {
  if (!userA || !userB || userA === userB) {
    return false;
  }

  const db = getDatabase();

  if (!db) {
    return false;
  }

  const viewerBlockedOwnerRows = await db
    .select({ blockerId: blocks.blockerId })
    .from(blocks)
    .where(and(eq(blocks.blockerId, userA), eq(blocks.blockedId, userB)))
    .limit(1);

  if (viewerBlockedOwnerRows.length > 0) {
    return true;
  }

  const ownerBlockedViewerRows = await db
    .select({ blockerId: blocks.blockerId })
    .from(blocks)
    .where(and(eq(blocks.blockerId, userB), eq(blocks.blockedId, userA)))
    .limit(1);

  return ownerBlockedViewerRows.length > 0;
}
