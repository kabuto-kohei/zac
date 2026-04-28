import { announcementFixtures, findAnnouncementFixture } from "@zac/shared";

export function listAnnouncements() {
  return announcementFixtures;
}

export function getAnnouncement(announcementId: string) {
  return findAnnouncementFixture(announcementId);
}
