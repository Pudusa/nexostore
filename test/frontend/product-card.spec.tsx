import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCard from '@/components/product-card';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

// Mock de datos de producto
const mockProduct: Product = {
  id: 'prod-1',
  name: 'Test Product Name',
  description: 'This is a test product description.',
  price: 99.99,
  imageUrls: ['/test-image.jpg'],
  managerId: 'user-1',
};

describe('ProductCard', () => {
  it('should render product name, description, and price', () => {
    render(<ProductCard product={mockProduct} />);

    // Verificar que el nombre del producto se renderiza
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();

    // Verificar que la descripción del producto se renderiza
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();

    // Verificar que el precio del producto se renderiza (formateado)
    expect(screen.getByText(formatPrice(mockProduct.price))).toBeInTheDocument();

    // Verificar que la imagen se renderiza con el src correcto
    const image = screen.getByRole('img', { name: mockProduct.name });
    expect(image).toBeInTheDocument();
    // El componente Image de Next.js modifica el src, por lo que verificamos que contenga la ruta base.
    expect(image).toHaveAttribute('src', expect.stringContaining(encodeURIComponent('/test-image.jpg')));
  });
});
