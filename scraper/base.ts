import { Browser } from "puppeteer";
import { Product } from "../definitions.ts";

export abstract class BaseScraper {
  pageLimit: number;
  browser: Browser;

  constructor(browser: Browser, pageLimit: number) {
    this.pageLimit = pageLimit;
    this.browser = browser;
  }

  abstract fetchProducts(query: string, options: any): Promise<Product[]>;
}
