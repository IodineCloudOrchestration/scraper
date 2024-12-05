import { fetchEbayProductsByQuery } from "../../api/ebay";

test("ebay-fetch-products", async () => {
  const products = await fetchEbayProductsByQuery("Iphone", 100);
  expect(products.length).toBe(100);
});
