import { eventFixtures, findEventFixture } from "@zac/shared";

export function listEvents() {
  return eventFixtures;
}

export function getEvent(eventId: string) {
  return findEventFixture(eventId);
}
