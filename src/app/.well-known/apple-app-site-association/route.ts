import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function readAppIds(): string[] {
  return (
    process.env.IOS_APP_LINK_APP_IDS ??
    process.env.IOS_APP_LINK_APP_ID ??
    "LPJVN6ARMX.com.example.budgetify.app"
  )
    .split(/[,\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function GET() {
  const appIds = readAppIds();

  const body = {
    applinks: {
      apps: [],
      details: appIds.map((appId) => ({
        appID: appId,
        paths: ["/partnership/accept"],
      })),
    },
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
