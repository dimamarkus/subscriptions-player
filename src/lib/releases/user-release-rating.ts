export const USER_RELEASE_RATING_HALF_STEP_VALUES = [
  2, 3, 4, 5, 6, 7, 8, 9, 10,
] as const;

export type UserReleaseRatingHalfSteps =
  (typeof USER_RELEASE_RATING_HALF_STEP_VALUES)[number];

export function isUserReleaseRatingHalfSteps(
  value: number,
): value is UserReleaseRatingHalfSteps {
  return USER_RELEASE_RATING_HALF_STEP_VALUES.includes(
    value as UserReleaseRatingHalfSteps,
  );
}

export function assertUserReleaseRatingHalfSteps(
  value: number,
): UserReleaseRatingHalfSteps {
  if (isUserReleaseRatingHalfSteps(value)) {
    return value;
  }

  throw new Error("Rating must be between 1 and 5 stars in half-star steps.");
}

export function formatUserReleaseRatingLabel(
  ratingHalfSteps: UserReleaseRatingHalfSteps,
) {
  const starCount = ratingHalfSteps / 2;
  const formattedStarCount = Number.isInteger(starCount)
    ? starCount.toFixed(0)
    : starCount.toFixed(1);

  return `${formattedStarCount} ${starCount === 1 ? "star" : "stars"}`;
}
