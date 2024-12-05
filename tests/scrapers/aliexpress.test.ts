import { Browser, launch } from "puppeteer";
import { fetchAliExpressProductByQuery } from "../../scrapers/aliexpress";

let browser: Browser;

test("aliexpress-fetch-products", async () => {
  const page = await browser.newPage();
  const products = await fetchAliExpressProductByQuery(page, "Iphone", 100);
  expect(products.length).toBe(100);
}, 20_000);

afterAll(async () => {
  await browser.close();
});

beforeAll(async () => {
  browser = await launch({headless: false});
});
