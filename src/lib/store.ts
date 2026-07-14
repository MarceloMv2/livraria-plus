import { create } from 'zustand';

interface CartItem {
  bookId: string;
  title: string;
  coverImage: string;
  price: number;
}

interface AppStore {
  cart: CartItem[];
  searchQuery: string;
  isMobileMenuOpen: boolean;
  isDarkMode: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  setSearchQuery: (query: string) => void;
  toggleMobileMenu: () => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  cart: [],
  searchQuery: '',
  isMobileMenuOpen: false,
  isDarkMode: false,
  addToCart: (item) =>
    set((state) => ({ cart: [...state.cart, item] })),
  removeFromCart: (bookId) =>
    set((state) => ({ cart: state.cart.filter((item) => item.bookId !== bookId) })),
  clearCart: () => set({ cart: [] }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  toggleDarkMode: () =>
    set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
