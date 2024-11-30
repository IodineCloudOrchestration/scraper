// import { Product } from "./definitions.ts";

// async function fetchBestBuyProductsByQuery(
//   query: string,
//   count: number,
// ): Promise<Product[]> {
//   const apiKey = "gETCH6droTsCukvq8aaODUyt";
//   const url =
//     `https://api.bestbuy.com/v1/products(search=${query})` +
//     `?format=json&show=name,salePrice,url,image,sku&apiKey=${apiKey}&pageSize=${count}`;
//   const resp = await fetch(url);
//   if (!resp.ok) {
//     throw Error(`Response: ${resp.status} | ${await resp.text()}`);
//   }
//   const data: { products: any[] } = await resp.json();
//   return data.products.map((p) => {
//     return {
//       name: p.name,
//       price: p.salePrice,
//       productUrl: `http://www.bestbuy.com/site/${p.name.replace("-", " ").replaceAll(/\s+/g, "-")}/${p.sku}.p`,
//       imageUrl: p.image,
//       valuta: "USD",
//     };
//   });
// }
// //www.bestbuy.com/site/AppleCare+-for-iPhone-2-Year-Plan/6558.p

// http: console.log(await fetchBestBuyProductsByQuery("Iphone", 10));
