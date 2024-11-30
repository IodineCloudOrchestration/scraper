import { Product } from "../definitions.ts";
import { getEnv } from "../config.ts";

export async function fetchEbayProductsByQuery(
  query: string,
  count: number,
): Promise<Product[]> {
  if (token === null) {
    token = await getToken();
  }

  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(count));

  const headers = new Headers({ Authorization: `Bearer ${token}` });
  let resp = await fetch(url, { headers });
  if (resp.status === 401) {
    token = await getToken(); // refresh token
    headers.set("Authorization", `Bearer ${token}`);
    resp = await fetch(url, { headers });
  }
  if (!resp.ok) {
    throw Error(`Response: ${resp.status} | ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.itemSummaries.map((item) => {
    return {
      imageUrl: item.image.imageUrl,
      productUrl: item.itemWebUrl,
      name: item.title,
      price: item.price.value,
      valuta: item.price.currency,
    };
  });
}

let token: string | null = null;

async function getToken(): Promise<string> {
  const scopes = ["https://api.ebay.com/oauth/api_scope"];
  const url = new URL("https://api.ebay.com/identity/v1/oauth2/token");
  url.searchParams.set("grant_type", "client_credentials");
  url.searchParams.set("scope", scopes.join(" "));

  const clientId = getEnv("EBAY_CLIENT_ID");
  const clientSecret = getEnv("EBAY_CLIENT_SECRET");

  const headers = {
    Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
  };
  const resp = await fetch(url, { headers, method: "POST" });
  if (!resp.ok) {
    throw Error(`Response: ${resp.status} | ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.access_token;
}
