import { NextResponse } from "next/server";

export interface EsportsArticle {
  id: string;
  title: string;
  url: string;
  image: string;
  category: string;
  date?: string;
  summary?: string;
}

export async function GET() {
  try {
    const response = await fetch("https://www.esports.id/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from esports.id`);
    }

    const html = await response.text();

    const articles: EsportsArticle[] = [];
    const seenUrls = new Set<string>();

    // Match links with href and inner content
    const linkPattern = /<a\s+[^>]*href="(https:\/\/www\.esports\.id\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;

    while ((match = linkPattern.exec(html)) !== null) {
      const url = match[1];
      const inner = match[2];

      // Ignore non-article URLs
      if (
        url.includes("#") ||
        url.includes("/category/") ||
        url.includes("/tag/") ||
        url.includes("/about") ||
        url.includes("/contact") ||
        url.includes("/privacy") ||
        seenUrls.has(url)
      ) {
        continue;
      }

      // Extract image if present
      const imgMatch = inner.match(/<img\s+[^>]*src="([^"]+)"/i);
      const imgUrl = imgMatch ? imgMatch[1] : "";

      // Clean title text
      const cleanTitle = inner
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (cleanTitle.length > 25 && imgUrl) {
        seenUrls.add(url);

        // Determine category based on title or URL
        let category = "ESPORTS";
        const lower = cleanTitle.toLowerCase();
        if (lower.includes("mobile legends") || lower.includes("mlbb") || lower.includes("mpl")) {
          category = "Mobile Legends";
        } else if (lower.includes("pubg") || lower.includes("pubgm") || lower.includes("pmgc")) {
          category = "PUBG Mobile";
        } else if (lower.includes("free fire") || lower.includes("ffws")) {
          category = "Free Fire";
        } else if (lower.includes("valorant") || lower.includes("vct")) {
          category = "Valorant";
        } else if (lower.includes("roblox")) {
          category = "Roblox";
        } else if (lower.includes("dota") || lower.includes("league of legends") || lower.includes("worlds")) {
          category = "PC Games";
        }

        articles.push({
          id: `news-${articles.length + 1}`,
          title: cleanTitle,
          url,
          image: imgUrl,
          category,
          date: "Hari ini",
          summary: "Berita esports terkini disajikan langsung dari portal liputan esports.id",
        });
      }
    }

    return NextResponse.json({
      success: true,
      source: "https://www.esports.id/",
      total: articles.length,
      data: articles.slice(0, 12),
    });
  } catch (error: any) {
    console.error("Failed to fetch esports.id feed:", error);
    // Return graceful fallback data so the page never breaks
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch esports.id",
        data: [
          {
            id: "fallback-1",
            title: "FFWS Indonesia Kembali: Tiket ke Global Finals Jadi Rebutan Tim Unggulan",
            url: "https://www.esports.id/",
            image: "https://cdn.esports.id/media/d2/bd/3e/d2bd3e0ee8414fd54e8d4ebc2f59cdf7.jpg",
            category: "Free Fire",
            date: "Terbaru",
            summary: "Turnamen kasta tertinggi Free Fire kembali menyajikan pertarungan sengit menuju panggung dunia.",
          },
          {
            id: "fallback-2",
            title: "Hasil MPL ID: Perebutan Puncak Klasemen Memanas Jelang Babak Playoffs",
            url: "https://www.esports.id/",
            image: "https://cdn.esports.id/media/a5/90/eb/a590ebbadafe21731899950acba8d246.jpeg",
            category: "Mobile Legends",
            date: "Terbaru",
            summary: "Tim-tim raksasa Mobile Legends Indonesia saling sikut dalam perebutan posisi upper bracket.",
          },
          {
            id: "fallback-3",
            title: "Persiapan Timnas PUBGM Indonesia Menatap Kejuaraan Tingkat Asia Tenggara",
            url: "https://www.esports.id/",
            image: "https://cdn.esports.id/media/4d/22/2f/4d222fb370e9708b951575d6ed10d8b6.jpeg",
            category: "PUBG Mobile",
            date: "Terbaru",
            summary: "Roster terbaik PUBG Mobile terus matangkan strategi dan rotasi map untuk meraih medali emas.",
          },
        ],
      },
      { status: 200 }
    );
  }
}
