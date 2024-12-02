import {Browser, launch} from "puppeteer";
import {fetchAmazonProductsByQuery} from "../scraper/amazon";

let browser: Browser;

afterAll(async () => {
  await browser.close();
});

beforeAll(async () => {
  browser = await launch({headless: false});

});

test("fetch-products-lego", async () => {
  const page = await browser.newPage();
  const products = await fetchAmazonProductsByQuery(page, "lego", 100);
  expect(products.length).toBe(100);
}, 20_000);

test("fetch-products-iphone-case", async () => {
  const page = await browser.newPage();
  const products = await fetchAmazonProductsByQuery(page, "iphone case", 100);
  expect(products.length).toBe(100);
}, 20_000);

test("fetch-products-book", async () => {
  const page = await browser.newPage();
  const products = await fetchAmazonProductsByQuery(page, "book", 100);
  expect(products.length).toBe(100);
}, 30_000);

