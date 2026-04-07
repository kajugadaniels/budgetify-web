import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function readFingerprints(): string[] {
  return (process.env.ANDROID_APP_LINK_SHA256_CERT_FINGERPRINTS ?? "")
    .split(/[,\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function GET() {
  const packageName =
    process.env.ANDROID_APP_LINK_PACKAGE_NAME ?? "com.example.budgetify";
  const fingerprints = readFingerprints();

  const body =
    fingerprints.length === 0
      ? []
      : [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: packageName,
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ];

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=300",
    },
  });
}
