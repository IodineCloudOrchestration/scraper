import { ElementHandle } from "puppeteer";
import { Product } from "../definitions";
import { Page } from "puppeteer";

export async function fetchAliExpressProductByQuery(
  page: Page,
  query: string,
  limit: number,
): Promise<Product[]> {
  let pageNumber = 1;
  let totalProducts: Product[] = [];
  while (totalProducts.length < limit) {
    await page.goto(getUrl({ query, pageNumber: pageNumber++ }));
    const products = await getProducts(page, limit - totalProducts.length);
    if (!products.length) break; // not found
    totalProducts = totalProducts.concat(products);
  }
  return totalProducts.slice(0, limit);
}

function getUrl(params: { query: string; pageNumber: number }): string {
  return `https://www.aliexpress.com/w/wholesale-${params.query}.html?page=${params.pageNumber}`;
}

async function getProducts(page: Page, limit: number): Promise<Product[]> {
  const cards = (await page.$$("#card-list > div")).slice(0, limit);
  const data: Product[] = [];
  for (const card of cards) {
    await card.scrollIntoView();
    const multiImage = (await card.waitForSelector(
      '[class^="multi--image"]',
    )) as ElementHandle<Element>;
    const imageUrl = await multiImage.$eval("img", (img) => img.src);
    const name = await card.$eval("h3", (elem) => String(elem.textContent));
    const productUrl = await card.$eval("a", (elem) => elem.href);
    const { valuta, price } = await card.$eval(
      '[class^="multi--price-sale"]',
      (elem) => {
        const priceSegments = Array.from(elem.children).map(
          (child) => child.textContent,
        );
        return {
          valuta: String(priceSegments[0]),
          price: parseFloat(priceSegments.slice(1).join("").replace(",", "")),
        };
      },
    );
    data.push({ imageUrl, name, valuta, price, productUrl });
  }
  return data;
}
