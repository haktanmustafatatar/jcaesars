/**
 * Official Shopify Admin API Integration
 */

export interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
}

export async function searchShopifyProducts(config: ShopifyConfig, query: string) {
  try {
    const { shopDomain, accessToken } = config;
    const url = `https://${shopDomain}/admin/api/2024-04/products.json?title=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.products.map((p: any) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      status: p.status,
      variants: p.variants.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: v.price,
        sku: v.sku,
        inventory_quantity: v.inventory_quantity,
      })),
    }));
  } catch (error) {
    console.error("[ShopifyIntegration] Search failed:", error);
    return [];
  }
}

export async function getShopifyInventory(config: ShopifyConfig, variantId: string) {
  try {
    const { shopDomain, accessToken } = config;
    // For Custom Apps, we can just get the product/variant directly
    const url = `https://${shopDomain}/admin/api/2024-04/variants/${variantId}.json`;
    
    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      id: data.variant.id,
      sku: data.variant.sku,
      inventory: data.variant.inventory_quantity,
      price: data.variant.price
    };
  } catch {
    return null;
  }
}
