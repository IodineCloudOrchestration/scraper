import {Browser, launch} from "puppeteer";
import {fetchZalandoProductsByQuery} from "../scraper/zalando";

let browser: Browser;

afterAll(async () => {
  await browser.close();
});

beforeAll(async () => {
  browser = await launch();
});

test("fetch-products", async () => {
  const page = await browser.newPage();
  const products = await fetchZalandoProductsByQuery(page, "man", 100);
  expect(products.length).toBe(100);
}, 20_000);

