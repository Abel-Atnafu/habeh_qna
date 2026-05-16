// Generated from Supabase schema. Do not edit by hand.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type EmptyRelationships = [];

export type Database = {
  public: {
    Tables: {
      daily_specials: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          price: number;
          title: string;
          valid_date: string;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          price?: number;
          title: string;
          valid_date: string;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          price?: number;
          title?: string;
          valid_date?: string;
        };
        Relationships: EmptyRelationships;
      };
      events: {
        Row: {
          active: boolean | null;
          created_at: string | null;
          date: string;
          description: string | null;
          id: string;
          image_url: string | null;
          time: string | null;
          title: string;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string | null;
          date: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          time?: string | null;
          title: string;
        };
        Update: {
          active?: boolean | null;
          created_at?: string | null;
          date?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          time?: string | null;
          title?: string;
        };
        Relationships: EmptyRelationships;
      };
      gallery: {
        Row: {
          caption: string | null;
          created_at: string | null;
          id: string;
          image_url: string | null;
          sort_order: number | null;
          url: string;
        };
        Insert: {
          caption?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          sort_order?: number | null;
          url: string;
        };
        Update: {
          caption?: string | null;
          created_at?: string | null;
          id?: string;
          image_url?: string | null;
          sort_order?: number | null;
          url?: string;
        };
        Relationships: EmptyRelationships;
      };
      menu_items: {
        Row: {
          available: boolean | null;
          category: string;
          created_at: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          is_fasting: boolean | null;
          is_spicy: boolean | null;
          is_veg: boolean | null;
          name: string;
          price: number;
          sort_order: number | null;
        };
        Insert: {
          available?: boolean | null;
          category: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_fasting?: boolean | null;
          is_spicy?: boolean | null;
          is_veg?: boolean | null;
          name: string;
          price: number;
          sort_order?: number | null;
        };
        Update: {
          available?: boolean | null;
          category?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_fasting?: boolean | null;
          is_spicy?: boolean | null;
          is_veg?: boolean | null;
          name?: string;
          price?: number;
          sort_order?: number | null;
        };
        Relationships: EmptyRelationships;
      };
      order_items: {
        Row: {
          id: string;
          line_total: number;
          menu_item_id: string | null;
          name: string;
          order_id: string | null;
          price: number;
          qty: number;
        };
        Insert: {
          id?: string;
          line_total?: number;
          menu_item_id?: string | null;
          name: string;
          order_id?: string | null;
          price: number;
          qty?: number;
        };
        Update: {
          id?: string;
          line_total?: number;
          menu_item_id?: string | null;
          name?: string;
          order_id?: string | null;
          price?: number;
          qty?: number;
        };
        Relationships: EmptyRelationships;
      };
      orders: {
        Row: {
          chapa_ref_id: string | null;
          created_at: string | null;
          currency: string;
          customer_name: string | null;
          delivery_address: string | null;
          email: string | null;
          id: string;
          notes: string | null;
          order_number: number;
          paid_at: string | null;
          payment_status: string;
          phone: string | null;
          status: string | null;
          subtotal: number;
          total: number;
          tx_ref: string | null;
          type: string | null;
        };
        Insert: {
          chapa_ref_id?: string | null;
          created_at?: string | null;
          currency?: string;
          customer_name?: string | null;
          delivery_address?: string | null;
          email?: string | null;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          payment_status?: string;
          phone?: string | null;
          status?: string | null;
          subtotal?: number;
          total?: number;
          tx_ref?: string | null;
          type?: string | null;
        };
        Update: {
          chapa_ref_id?: string | null;
          created_at?: string | null;
          currency?: string;
          customer_name?: string | null;
          delivery_address?: string | null;
          email?: string | null;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          payment_status?: string;
          phone?: string | null;
          status?: string | null;
          subtotal?: number;
          total?: number;
          tx_ref?: string | null;
          type?: string | null;
        };
        Relationships: EmptyRelationships;
      };
      reservations: {
        Row: {
          created_at: string | null;
          date: string;
          guests: number;
          id: string;
          name: string;
          phone: string;
          special_requests: string | null;
          status: string | null;
          time: string;
        };
        Insert: {
          created_at?: string | null;
          date: string;
          guests: number;
          id?: string;
          name: string;
          phone: string;
          special_requests?: string | null;
          status?: string | null;
          time: string;
        };
        Update: {
          created_at?: string | null;
          date?: string;
          guests?: number;
          id?: string;
          name?: string;
          phone?: string;
          special_requests?: string | null;
          status?: string | null;
          time?: string;
        };
        Relationships: EmptyRelationships;
      };
      settings: {
        Row: {
          announcement_active: boolean | null;
          announcement_text: string | null;
          id: string;
          reservations_open: boolean | null;
          vat_note: string | null;
          whatsapp: string | null;
        };
        Insert: {
          announcement_active?: boolean | null;
          announcement_text?: string | null;
          id?: string;
          reservations_open?: boolean | null;
          vat_note?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          announcement_active?: boolean | null;
          announcement_text?: string | null;
          id?: string;
          reservations_open?: boolean | null;
          vat_note?: string | null;
          whatsapp?: string | null;
        };
        Relationships: EmptyRelationships;
      };
      testimonials: {
        Row: {
          body: string;
          created_at: string | null;
          id: string;
          name: string;
          rating: number | null;
          visible: boolean | null;
        };
        Insert: {
          body: string;
          created_at?: string | null;
          id?: string;
          name: string;
          rating?: number | null;
          visible?: boolean | null;
        };
        Update: {
          body?: string;
          created_at?: string | null;
          id?: string;
          name?: string;
          rating?: number | null;
          visible?: boolean | null;
        };
        Relationships: EmptyRelationships;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
