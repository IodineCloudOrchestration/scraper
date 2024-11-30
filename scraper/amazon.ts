import { launch, Page } from "puppeteer";
import { Product } from "../definitions.ts";

export async function fetchAmazonProductsByQuery(
  page: Page,
  query: string,
  count: number,
): Promise<Product[]> {
  let pageNumber = 1;
  let totalProducts: Product[] = [];
  while (totalProducts.length < count) {
    await page.goto(getUrl({ query, pageNumber: pageNumber++ }), {});
    const products = await getProducts(page);
    if (!products.length) break; // not found
    totalProducts = totalProducts.concat(products);
  }
  return totalProducts.slice(0, count);
}

function getUrl(params: { query: string; pageNumber: number }) {
  return `https://www.amazon.com/s?k=${params.query}&page=${params.pageNumber}`;
}

function getProducts(page: Page): Promise<Product[]> {
  const selector = '[data-component-type="s-search-result"]';
  return page.$$eval(selector, (results) => {
    const data: Product[] = [];
    for (const res of results) {
      const priceElement = res.querySelector(".a-price > .a-offscreen");
      if (priceElement === null) throw Error("There is no price element");
      const price = Number(String(priceElement.textContent).slice(1));
      if (Number.isNaN(price))
        throw Error(`Invalid price: ${priceElement.textContent}`);

      const titleLink = res.querySelector<HTMLAnchorElement>(
        '[data-cy="title-recipe"] > h2 > a',
      );
      if (titleLink === null) throw Error("There is no title link element");
      if (!titleLink.textContent) {
        throw Error("There is no a product name in a title link element");
      }

      const image = res.querySelector<HTMLImageElement>(".s-image");
      if (image === null) throw Error("There is no image element");

      data.push({
        price,
        name: titleLink.textContent,
        productUrl: titleLink.href,
        imageUrl: image.src,
        valuta: "USD",
      });
    }
    return data;
  });
}
