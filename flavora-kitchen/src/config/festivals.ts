export interface FestivalCampaign {
  id: string;
  name: string;
  startDate: string; // ISO format or YYYY-MM-DD
  endDate: string; // ISO format or YYYY-MM-DD
  description: string;
  tag: string;
  dishIds: number[]; // Dishes linked to this festival
}

export const FESTIVAL_CAMPAIGNS: FestivalCampaign[] = [
  {
    id: "diwali-2026",
    name: "🪔 Diwali Sweets & Specials",
    startDate: "2026-10-15",
    endDate: "2026-11-05",
    description: "Celebrate the festival of lights with our curated gourmet desserts and signature royal starters.",
    tag: "Diwali Special",
    dishIds: [101, 102, 301, 302] // Example starters and desserts
  },
  {
    id: "summer-gourmet-2026",
    name: "🍹 Summer Refresh Festival",
    startDate: "2026-06-01",
    endDate: "2026-07-15", // Active right now in June 2026!
    description: "Cool down with our handcrafted summer coolers, fresh salads, and artisanal cold treats.",
    tag: "Summer Special",
    dishIds: [401, 402, 305, 306] // Handcrafted coolers, drinks, and desserts
  }
];

/**
 * Helper to check if a festival campaign is currently active based on system date
 */
export function getActiveFestival(currentDate: Date = new Date()): FestivalCampaign | null {
  const time = currentDate.getTime();
  for (const campaign of FESTIVAL_CAMPAIGNS) {
    const start = new Date(campaign.startDate).getTime();
    const end = new Date(campaign.endDate).getTime();
    if (time >= start && time <= end) {
      return campaign;
    }
  }
  return null;
}
