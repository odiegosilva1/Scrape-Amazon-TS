import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";

const app = express();
const PORT = 3000;

app.get("/api/scrape", async (req, res) => {
  try {
    const keyword = req.query.keyword as string;
    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
      keyword
    )}`;
    const { data } = await axios.get(amazonUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const dom = new JSDOM(data);
    const document = dom.window.document;

    const products = Array.from(document.querySelectorAll(".s-result-item"))
      .map((item) => {
        const title = item.querySelector("h2 a span")?.textContent;
        const rating = item.querySelector(
          ".a-icon-star-small .a-icon-alt"
        )?.textContent;
        const reviews = item.querySelector(
          ".a-size-small .a-link-normal .a-size-base"
        )?.textContent;
        const imageUrl = item.querySelector("img.s-image")?.getAttribute("src");

        return {
          title: title?.trim(),
          rating: rating?.replace(" out of 5 stars", ""),
          reviews: reviews?.trim(),
          imageUrl,
        };
      })
      .filter((product) => product.title);

    res.json(products);
  } catch (error) {
    console.error("Error scraping Amazon:", error);
    res.status(500).json({ error: "Failed to scrape Amazon" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
