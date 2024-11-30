// import { launch } from "puppeteer";
// import { Product } from "./definitions.ts";
// import { fetchAmazonProductsByQuery } from "./amazon.ts";
// import { fetchAliExpressProductByQuery } from "./aliexpress.ts";
// import { fetchZalandoProductsByQuery } from "./zalando.ts";

// interface ScraperParams {
//   query: string;
// }

// const platformFunctions = {
//   "amazon.com": fetchAmazonProductsByQuery,
//   "aliexpress.com": fetchAliExpressProductByQuery,
//   "zalando.com": fetchZalandoProductsByQuery,
// };

// export async function retrieveProducts(
//   query: string,
//   count: number,
//   platforms: string[],
// ): Promise<Product[]> {
//   const browser = await launch({ headless: true });
//   try {
//     const products = await Promise.all(
//       platforms.map(async (platName) => {
//         const page = await browser.newPage();
//         return platformFunctions[platName](page, query, count);
//       }),
//     );
//     return [].concat(...products);
//   } finally {
//     await browser.close();
//   }
// }
