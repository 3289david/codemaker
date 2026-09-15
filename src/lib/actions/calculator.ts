"use server";

import { calculateEstimate, type CalcResult } from "@/lib/pricing";

export async function estimateAction(projectType: string, featureKeys: string[]): Promise<CalcResult> {
  return calculateEstimate(projectType, featureKeys);
}
