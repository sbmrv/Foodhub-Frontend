/**
 * Downloads food images into public/Assets.
 * Run from FoodHub folder: npm run download-images
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const OUT_DIR = path.join(__dirname, "..", "public", "Assets");

const IMAGES = {
  "banner.jpg": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80",
  "breakfast.jpg": "https://images.unsplash.com/photo-1484723091731-f0365eebf563?auto=format&fit=crop&w=800&q=80",
  "lunch.jpg": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "snacks.jpg": "https://images.unsplash.com/photo-1562604817631-2604d0719941?auto=format&fit=crop&w=800&q=80",
  "dinner.jpg": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
  "drinks.jpg": "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80",
  "nightlife.jpg": "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
  "north-indian.jpg": "https://images.unsplash.com/photo-1578898887935-0d7d17036743?auto=format&fit=crop&w=800&q=80",
  "south-indian.jpg": "https://images.unsplash.com/photo-1589302160288-f265f5322dbc?auto=format&fit=crop&w=800&q=80",
  "chinese.jpg": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
  "fastfood.jpg": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
  "streetfood.jpg": "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=800&q=80",
  "restaurant-1.jpg": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  "restaurant-2.jpg": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
  "restaurant-3.jpg": "https://images.unsplash.com/photo-1551218377-c1d4d151668c?auto=format&fit=crop&w=800&q=80",
  "restaurant-4.jpg": "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=800&q=80",
  "restaurant-5.jpg": "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
  "restaurant-6.jpg": "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80",
  "menu-item.jpg": "https://images.unsplash.com/photo-1555939594-58d7cb561da1?auto=format&fit=crop&w=600&q=80",
  "beverage.jpg": "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
};

const download = (url, dest) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { "User-Agent": "FoodHub-Asset-Script" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
  });

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const fallback = path.join(OUT_DIR, "lunch.jpg");
  console.log("Downloading images to", OUT_DIR);

  for (const [filename, url] of Object.entries(IMAGES)) {
    const dest = path.join(OUT_DIR, filename);
    process.stdout.write(`  ${filename}... `);
    try {
      await download(url, dest);
      console.log("ok");
    } catch (err) {
      console.log(`failed (${err.message}), using fallback`);
      if (fs.existsSync(fallback)) {
        fs.copyFileSync(fallback, dest);
      }
    }
  }
  console.log("Done.");
}

main();
