import {Browser, launch} from "puppeteer";
import {fetchAmazonProductsByQuery} from "../scraper/amazon";

let browser: Browser;

afterAll(async () => {
  await browser.close();
});

beforeAll(async () => {
  browser = await launch({headless: false});
});

test("fetch-products", async () => {
  const page = await browser.newPage();
  const products = await fetchAmazonProductsByQuery(page, "book", 20);
  expect(products.length).toBe(20);
}, 20_000);

