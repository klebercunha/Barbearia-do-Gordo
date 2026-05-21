export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  loyaltyPoints: number; // 1 point per service completed, 10 points = free haircut
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
  category: 'cabelo' | 'barba' | 'combo' | 'outros';
}

export interface Barber {
  id: string;
  name: string;
  avatarUrl: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  serviceId: string;
  barberId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'cancelled';
  price: number; // Price calculated when booked (incorporating discounts)
  couponCode?: string;
  rating?: number;
  review?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  isActive: boolean;
  minBookingValue?: number;
}

export interface SystemSettings {
  whatsappNumber: string;
  address: string;
  googleMapsUrl: string;
  openHour: string; // e.g. "09:00"
  closeHour: string; // e.g. "20:00"
  intervalMinutes: number; // default 30 or 60 minutes
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'confirm' | 'reminder' | 'promo';
  createdAt: string;
  isRead: boolean;
}
