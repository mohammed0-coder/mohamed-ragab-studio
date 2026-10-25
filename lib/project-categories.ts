export const PROJECT_CATEGORIES = [
  "Brand Identity",
  "Web Development",
  "Software Development",
  "Graphic Design",
  "Social Media Design",
  "Motion Graphics",
  "Video Editing",
  "Advertising",
  "Other",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
