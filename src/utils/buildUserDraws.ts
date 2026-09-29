import type { Draw, Entry, UserDraw } from "@/types/draws";

export function buildUserDraws(
  draws: Draw[],
  entries: Entry[],
  userId: string,
  now: Date
): UserDraw[] {
  const userEntries = entries.filter((entry) => entry.userId === userId);

  const userDraws: UserDraw[] = draws
    .map((draw) => {
      const codes = userEntries
        .filter((entry) => entry.drawId === draw.id)
        .flatMap((entry) => entry.codes);

      return {
        draw,
        isActive: new Date(draw.endsAt) > now,
        codes,
        totalCodes: codes.length,
      };
    })
    .filter((userDraw) => userDraw.codes.length > 0);

  return userDraws.sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }
    const aEndsAt = new Date(a.draw.endsAt).getTime();
    const bEndsAt = new Date(b.draw.endsAt).getTime();
    return a.isActive ? aEndsAt - bEndsAt : bEndsAt - aEndsAt;
  });
}
