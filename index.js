const axios = require("axios");
const cheerio = require("cheerio");

const browserlessUrl = "https://chrome.browserless.io/content";
const token = "2SIb60dwXdzNQlG048bfbbda2d58baa30d618d5bbde0b3e59";
const url = "https://www.virginplus.ca/en/phones/phones-summary.html";

(async () => {
  try {
    const response = await axios.post(
      browserlessUrl,
      { url },
      {
        headers: { "Cache-Control": "no-cache" },
        params: { token }
      }
    );

    const html = response.data;
    const $ = cheerio.load(html);

    const products = [];

    $(".item.phone").each((_, el) => {
      const name = $(el).find(".phoneTitle").text().trim();

      let link = $(el).find("a[href*='phone-details.html']").attr("href");
      if (link && link.startsWith("phone-details.html")) {
        link = `https://www.virginplus.ca/en/phones/${link}`;
      }

      const img =
        $(el).find("img.phonepic").attr("src") ||
        $(el).find("img.phonepic").attr("data-ng-src") ||
        $(el).find("img.phonepic").attr("data-src") ||
        null;

      const imageUrl = img?.startsWith("/") ? `https://www.virginplus.ca${img}` : img;

      products.push({
        category: url,
        name,
        link,
        img: imageUrl
      });
    });

    // ✅ Output JSON in format like your screenshot
    console.log(JSON.stringify({ products }, null, 2));

  } catch (err) {
    console.error("Browserless scrape failed:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
    }
  }
})();
