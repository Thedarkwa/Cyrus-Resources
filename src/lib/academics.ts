export const STAGES = ["Pre-School", "Primary", "O Level", "A Level"] as const;
export type Stage = (typeof STAGES)[number];

export const YEARS_BY_STAGE: Record<Stage, string[]> = {
  "Pre-School": ["Pre-School"],
  Primary: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"],
  "O Level": ["Year 7", "Year 8", "Year 9"],
  "A Level": ["Year 10", "Year 11", "Year 12"],
};

export const STAGE_BLURB: Record<Stage, string> = {
  "Pre-School": "Explore resources for early learners.",
  Primary: "Years 1–6",
  "O Level": "Years 7–9",
  "A Level": "Years 10–12",
};

export const ALL_YEARS = STAGES.flatMap((s) => YEARS_BY_STAGE[s]);

export function isStage(value: string | undefined): value is Stage {
  return !!value && (STAGES as readonly string[]).includes(value);
}

export function summariseYears(years: string[] | null | undefined): string {
  if (!years || years.length === 0) return "All years";
  if (years.length === 1) return years[0];
  return `${years[0]}–${years[years.length - 1].replace("Year ", "")}`;
}
