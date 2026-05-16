export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  is_fasting: boolean;
  is_veg: boolean;
  is_spicy: boolean;
  available: boolean;
  sort_order: number;
  image_url: string | null;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  image_url: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  body: string;
  rating: number;
  visible: boolean;
  created_at: string;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  special_requests: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Settings {
  id: string;
  whatsapp: string | null;
  announcement_text: string | null;
  announcement_active: boolean;
  vat_note: string | null;
  reservations_open: boolean;
}

export interface DailySpecial {
  id: string;
  title: string;
  description: string | null;
  price: number;
  valid_date: string;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

export type OrderType = 'pickup' | 'delivery' | 'dine-in';
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface Order {
  id: string;
  order_number: number;
  tx_ref: string | null;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  type: OrderType;
  delivery_address: string | null;
  notes: string | null;
  subtotal: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  chapa_ref_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  qty: number;
  line_total: number;
}

export interface CartLine {
  menu_item_id: string;
  name: string;
  price: number;
  qty: number;
  image_url: string | null;
}

export const MENU_CATEGORIES = [
  'All',
  'Breakfast',
  'Main Courses',
  'Salad',
  'Pasta',
  'Snack Wrap',
  'Taco',
  'Burgers',
  'Pizza',
  'Takeaway',
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];
