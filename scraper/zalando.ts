import { EvaluateFuncWith } from "puppeteer";
import { Product } from "../definitions.ts";
import { Page, launch } from "puppeteer";

export async function fetchZalandoProductsByQuery(
  page: Page,
  query: string,
  count: number,
): Promise<Product[]> {
  let pageNumber = 1;
  let totalProducts: Product[] = [];
  let pageUrl = getUrl({ query, pageNumber: pageNumber++ });
  while (true) {
    await page.goto(pageUrl);
    const products = await getProducts(page);
    totalProducts = totalProducts.concat(products);
    if (totalProducts.length < count) break;

    // if page param in url go out of the limit, zalando just redirect to the last page
    // to prevent infinitive loop, check if the next page button is active
    pageUrl = await page.$eval(
      '[data-testid="pagination-next"]',
      (link) => (link as HTMLLinkElement).href,
    );
    if (pageUrl[pageUrl.length - 1] === "#") break;
  }
  return totalProducts.slice(0, count);
}

function getUrl(params: { query: string; pageNumber: number }) {
  return `https://www.zalando.hr/katalog/?p=${params.pageNumber}&q=${params.query}`;
}

async function getProducts(page: Page): Promise<Product[]> {
  await page.waitForSelector("article");
  return page.$$eval("article", (articles) => {
    const data: Product[] = [];
    for (const article of articles) {
      const headerElement = article.querySelector("header");
      if (headerElement === null) break;

      const nameElement = headerElement.children[0].children[1];
      if (!nameElement) throw Error("There is no name element.");

      if (!nameElement.textContent) {
        throw Error("There is no a product name in a title link element");
      }

      const priceElement = headerElement.children[1].children[0];
      if (priceElement === null) throw Error("There is no price element.");

      const priceRaw = String(priceElement.textContent);

      const price = Number(
        priceRaw.slice(0, -1).replace(".", "").replace(",", "."),
      );
      if (Number.isNaN(price)) throw Error(`Invalid price: ${price}`);

      const imageElement = article.querySelector("img");
      if (imageElement === null) throw Error("There is no image element.");

      const productLinkElement = article.querySelector("a");
      if (productLinkElement === null) throw Error("There is no link element.");

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

// const browser = await launch({ headless: false });
// const page = await browser.newPage();
// console.log(await fetchZalandoProductsByQuery(page, "query", 2));
// await browser.close();
