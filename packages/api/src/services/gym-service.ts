import { findGymFixture, gymFixtures } from "@zac/shared";

export function listGyms() {
  return gymFixtures;
}

export function getGym(gymId: string) {
  return findGymFixture(gymId);
}

