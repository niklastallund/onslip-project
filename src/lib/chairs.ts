"use server";

import { api } from "./onslipClient";

/* Please not that chairs are handled as tabs in Onslip 360, 
  plus any labeles required to implement the extra functionality
  needed that is not provided by the tabs in the api. */


export async function listAllChairs() {
  const chairs = await api.listTabs();

  return chairs;
}

export async function getChair(chairId: number) {
  const chair = await api.getTab(chairId);

  return chair;
}