import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const targetUrl = "https://www.esports.id/";
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    let html = await res.text();

    // Inject <base> tag so all relative assets, css, and images resolve to https://www.esports.id/
    // and all link clicks open in new tabs
    const baseTag = `<base href="https://www.esports.id/" target="_blank">`;
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>${baseTag}`);
    } else {
      html = baseTag + html;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Remove frame restrictions
        "X-Frame-Options": "ALLOWALL",
        "Content-Security-Policy": "frame-ancestors *",
      },
    });
  } catch (err: any) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:2rem;text-align:center;color:#64748b;">
        <h3>Gagal memuat portal esports.id</h3>
        <p>Silakan buka langsung di <a href="https://www.esports.id/" target="_blank" style="color:#0030FF;">https://www.esports.id/</a></p>
      </body></html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
