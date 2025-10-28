import { Product } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
}

export async function createProduct(productData: objectOutputType<{
    name: ZodString;
    description: ZodString;
    price: ZodNumber;
    imageUrls: ZodString;
    managerId: ZodString
}, ZodType<any, any, any>, "strip">): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw new Error('Failed to create product');
  }

  return await response.json();
}
