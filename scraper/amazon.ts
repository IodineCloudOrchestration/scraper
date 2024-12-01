import {Page} from "puppeteer";
import {Product} from "../definitions";
import {nextTick} from "process";

export async function fetchAmazonProductsByQuery(
  page: Page,
  query: string,
  limit: number,
): Promise<Product[]> {
  await page.goto(`https://www.amazon.com/s?k=${query}`);

  // check if I been redirected to category page
  const url = new URL(page.url());
  if (!url.searchParams.get("k")) {
    // query parameter will disappear if that happens
    url.searchParams.set("k", query);
    await page.goto(url.toString());
  }

  let totalProducts: Product[] = [];
  while (true) {
    const products = await getProducts(page);
    totalProducts = totalProducts.concat(products);
    if (totalProducts.length >= limit) break // enough products

    const nextPageUrl = await getNextPageUrl(page);
    if (nextPageUrl === undefined) break // there are no more pages
    await page.goto(nextPageUrl);
  }
  return totalProducts.slice(0, limit);
}

function getNextPageUrl(page: Page): Promise<undefined | string> {
  return page.evaluate(() => {
    return document.querySelector<HTMLAnchorElement>(
      'a[aria-label^="Go to next page"]',
    )?.href;
  });
}

function getProducts(page: Page): Promise<Product[]> {
  const selector = '[data-component-type="s-search-result"]';
  return page.$$eval(selector, (results) => {
    const products: Product[] = [];
    for (const res of results) {
      const priceElement = res.querySelector(".a-price > .a-offscreen");
      if (priceElement === null) continue; // item out of stock or cannot be delivered
      const price = Number(String(priceElement.textContent).slice(1));
      if (Number.isNaN(price)) {
        throw Error(`Invalid price: ${priceElement.textContent}`);
      }
      const titleLink = res.querySelector<HTMLAnchorElement>(
        '[data-cy="title-recipe"] > h2 > a',
      );
      if (titleLink === null) throw Error("There is no title link element");
      if (!titleLink.textContent) {
        throw Error("There is no a product name in a title link element");
      }

      const image = res.querySelector<HTMLImageElement>(".s-image");
      if (image === null) throw Error("There is no image element");

      products.push({
        price,
        name: titleLink.textContent,
        productUrl: titleLink.href,
        imageUrl: image.src,
        valuta: "USD",
      });
    }
    return products;
  });
}
