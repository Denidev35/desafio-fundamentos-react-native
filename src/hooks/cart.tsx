import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cartProducts = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (cartProducts) {
        setProducts(JSON.parse(cartProducts));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function saveProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    }

    saveProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const updateProducts = [...products];

      const productIndex = products.findIndex(
        productCart => productCart.id === product.id,
      );

      if (productIndex >= 0) {
        updateProducts[productIndex] = {
          ...products[productIndex],
          quantity: products[productIndex].quantity + 1,
        };
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const updateProducts = [...products];

      const productIndex = products.findIndex(item => item.id === id);

      if (productIndex > -1) {
        updateProducts[productIndex].quantity += 1;
        setProducts(updateProducts);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const updateProducts = [...products];

      const productIndex = products.findIndex(item => item.id === id);

      if (productIndex > -1) {
        updateProducts[productIndex].quantity <= 1
          ? updateProducts.splice(productIndex, 1)
          : (updateProducts[productIndex].quantity -= 1);

        setProducts(updateProducts);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
