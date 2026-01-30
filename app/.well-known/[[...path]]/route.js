// Handle Chrome DevTools and other .well-known requests without running the app layout.
// Prevents "Invalid hook call" when Chrome requests /.well-known/appspecific/com.chrome.devtools.json
import { NextResponse } from "next/server";

export function GET() {
  return new NextResponse(null, { status: 404 });
}
