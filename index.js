const cors = require('cors');
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Web Data Scraper!');
});

const urls = [
  "https://www.virginplus.ca/en/phones/phones-summary.html",
];

app.get('/list', async (req, res) => {
  const allProducts = [];

  for (const url of urls) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
        },
      });

      const $ = cheerio.load(data);

      $(".item.phone").each((_, el) => {
        const name = $(el).find(".phoneTitle").text().trim();
        let link = $(el).find("a[href*='phone-details.html']").attr("href");
        if (link && link.startsWith("phone-details.html")) {
          link = `https://www.virginplus.ca/en/phones/${link}`;
        }
        const img = $(el).find(".phonepic").attr("data-src") ||
                    $(el).find(".phonepic").attr("data-ng-src")||
                    $(el).find(".phonepic").attr("src");

        allProducts.push({
          category: url,
          name,
          link: link,
          img
        });
      });

    } catch (error) {
      console.error(`Scraping failed for ${url}:`, error.message);
    }
  }

  res.json({ products: allProducts });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
