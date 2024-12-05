import {Product} from "../definitions";
import {Page} from "puppeteer";

export async function fetchZalandoProductsByQuery(
  page: Page,
  query: string,
  count: number,
): Promise<Product[]> {
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
  await page.goto(`https://www.zalando.hr/katalog/?q=${query}`);
  let totalProducts: Product[] = [];
  while (true) {
    const products = await getProducts(page);
    totalProducts = totalProducts.concat(products);
    if (totalProducts.length >= count) break

    const nextPageUrl = await getNextPageUrl(page)
    if (!nextPageUrl) break
    await page.goto(nextPageUrl);
  }
  return totalProducts.slice(0, count);
}

async function getNextPageUrl(page: Page): Promise<string | undefined> {
  const pageUrl = await page.$eval(
    '[data-testid="pagination-next"]',
    (link) => (link as HTMLLinkElement).href,
  );
  return pageUrl.endsWith("#") ? undefined : pageUrl
}

async function getProducts(page: Page): Promise<Product[]> {
  await page.waitForSelector('[data-testid="pagination-next"]') // wait to load all articles
  return page.$$eval("article", (articles) => {
    const data: Product[] = [];
    for (const article of articles) {

      const nameElement = article.querySelector("header > div");
      if (!nameElement) continue // skip add


      const priceSection = article.querySelector("section > p")
      if (!priceSection) throw Error("There is no name section element");
      const priceElement = priceSection.children[priceSection.children.length - 1]
      if (!priceElement) throw Error("There is no price element.");
      const priceRaw = String(priceElement.textContent);
      const price = Number(
        priceRaw.slice(0, -1).replace(".", "").replace(",", "."),
      );
      if (Number.isNaN(price)) throw Error(`Invalid price: ${price}`);

      if (!nameElement.textContent) {
        throw Error("There is no a product name in a title link element");
      }

      const imageElement = article.querySelector("img");
      if (!imageElement) throw Error("There is no image element.");

      const productLinkElement = article.querySelector("a");
      if (!productLinkElement) throw Error("There is no link element.");

      data.push({
        price,
        name: nameElement.textContent,
        productUrl: productLinkElement.href,
        imageUrl: imageElement.src,
        valuta: "USD",
      });
    }
    return data;
  });
}
