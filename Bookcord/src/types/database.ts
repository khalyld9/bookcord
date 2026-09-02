export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoleName = "ADMIN" | "USER";
export type MovementType = "RESTOCK" | "ISSUE" | "RETURN" | "ADJUSTMENT";
export type IssueStatus = "ISSUED" | "RETURNED" | "PARTIALLY_RETURNED";
export type ReturnCondition = "GOOD" | "FAIR" | "DAMAGED" | "LOST";
export type ChatSender = "STUDENT" | "ADMIN";
export type HoldStatus =
  | "PENDING"
  | "READY"
  | "FULFILLED"
  | "CANCELLED"
  | "EXPIRED";

type Timestamp = string;

type TableRow<T> = T & Record<string, unknown>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          full_name: string;
          student_id: string | null;
          email: string;
          year_level_id: string | null;
          strand_id: string | null;
          role: RoleName;
          status: "ACTIVE" | "DISABLED";
          avatar_url: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          full_name: string;
          student_id?: string | null;
          email: string;
          year_level_id?: string | null;
          strand_id?: string | null;
          role?: RoleName;
          status?: "ACTIVE" | "DISABLED";
          avatar_url?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      roles: {
        Row: { id: string; name: RoleName; created_at: Timestamp };
        Insert: { id?: string; name: RoleName; created_at?: Timestamp };
        Update: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          title: string;
          isbn: string | null;
          author_id: string | null;
          subject_id: string | null;
          description: string | null;
          cover_image_url: string | null;
          semester_id: string | null;
          strand_id: string | null;
          year_level_id: string | null;
          minimum_stock: number;
          created_at: Timestamp;
          updated_at: Timestamp;
          archived_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          title: string;
          isbn?: string | null;
          author_id?: string | null;
          subject_id?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          semester_id?: string | null;
          strand_id?: string | null;
          year_level_id?: string | null;
          minimum_stock?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
          archived_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["books"]["Row"]>;
        Relationships: [];
      };
      authors: {
        Row: { id: string; name: string; created_at: Timestamp; archived_at: Timestamp | null };
        Insert: { id?: string; name: string; created_at?: Timestamp; archived_at?: Timestamp | null };
        Update: Partial<Database["public"]["Tables"]["authors"]["Row"]>;
        Relationships: [];
      };
      subjects: {
        Row: { id: string; name: string; created_at: Timestamp; archived_at: Timestamp | null };
        Insert: { id?: string; name: string; created_at?: Timestamp; archived_at?: Timestamp | null };
        Update: Partial<Database["public"]["Tables"]["subjects"]["Row"]>;
        Relationships: [];
      };
      strands: {
        Row: { id: string; name: string; created_at: Timestamp; archived_at: Timestamp | null };
        Insert: { id?: string; name: string; created_at?: Timestamp; archived_at?: Timestamp | null };
        Update: Partial<Database["public"]["Tables"]["strands"]["Row"]>;
        Relationships: [];
      };
      semesters: {
        Row: { id: string; name: string; created_at: Timestamp; archived_at: Timestamp | null };
        Insert: { id?: string; name: string; created_at?: Timestamp; archived_at?: Timestamp | null };
        Update: Partial<Database["public"]["Tables"]["semesters"]["Row"]>;
        Relationships: [];
      };
      year_levels: {
        Row: { id: string; name: string; sort_order: number; created_at: Timestamp; archived_at: Timestamp | null };
        Insert: { id?: string; name: string; sort_order?: number; created_at?: Timestamp; archived_at?: Timestamp | null };
        Update: Partial<Database["public"]["Tables"]["year_levels"]["Row"]>;
        Relationships: [];
      };
      inventory: {
        Row: {
          id: string;
          book_id: string;
          total_stock: number;
          available_stock: number;
          issued_stock: number;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          book_id: string;
          total_stock?: number;
          available_stock?: number;
          issued_stock?: number;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["inventory"]["Row"]>;
        Relationships: [];
      };
      restocks: {
        Row: {
          id: string;
          book_id: string;
          quantity: number;
          restock_date: Timestamp;
          supplier: string | null;
          reference_number: string | null;
          cost_per_book: number | null;
          total_cost: number | null;
          notes: string | null;
          added_by: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          book_id: string;
          quantity: number;
          restock_date?: Timestamp;
          supplier?: string | null;
          reference_number?: string | null;
          cost_per_book?: number | null;
          total_cost?: number | null;
          notes?: string | null;
          added_by?: string | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["restocks"]["Row"]>;
        Relationships: [];
      };
      stock_movements: {
        Row: {
          id: string;
          book_id: string;
          movement_type: MovementType;
          quantity_change: number;
          reference_id: string | null;
          reference_table: string | null;
          reason: string | null;
          notes: string | null;
          performed_by: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          book_id: string;
          movement_type: MovementType;
          quantity_change: number;
          reference_id?: string | null;
          reference_table?: string | null;
          reason?: string | null;
          notes?: string | null;
          performed_by?: string | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["stock_movements"]["Row"]>;
        Relationships: [];
      };
      book_issues: {
        Row: {
          id: string;
          book_id: string;
          profile_id: string;
          quantity: number;
          returned_quantity: number;
          date_issued: Timestamp;
          expected_return_date: string | null;
          notes: string | null;
          status: IssueStatus;
          issued_by: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          book_id: string;
          profile_id: string;
          quantity: number;
          returned_quantity?: number;
          date_issued?: Timestamp;
          expected_return_date?: string | null;
          notes?: string | null;
          status?: IssueStatus;
          issued_by?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["book_issues"]["Row"]>;
        Relationships: [];
      };
      book_returns: {
        Row: {
          id: string;
          issue_id: string;
          book_id: string;
          profile_id: string;
          quantity: number;
          date_returned: Timestamp;
          condition: ReturnCondition;
          notes: string | null;
          processed_by: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          issue_id: string;
          book_id: string;
          profile_id: string;
          quantity: number;
          date_returned?: Timestamp;
          condition?: ReturnCondition;
          notes?: string | null;
          processed_by?: string | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["book_returns"]["Row"]>;
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          profile_id: string;
          sender: ChatSender;
          body: string;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          profile_id: string;
          sender: ChatSender;
          body: string;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Row"]>;
        Relationships: [];
      };
      saved_books: {
        Row: {
          id: string;
          profile_id: string;
          book_id: string;
          note: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          profile_id: string;
          book_id: string;
          note?: string | null;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["saved_books"]["Row"]>;
        Relationships: [];
      };
      hold_requests: {
        Row: {
          id: string;
          profile_id: string;
          book_id: string;
          status: HoldStatus;
          needed_by: string | null;
          note: string | null;
          requested_at: Timestamp;
          updated_at: Timestamp;
          fulfilled_at: Timestamp | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          book_id: string;
          status?: HoldStatus;
          needed_by?: string | null;
          note?: string | null;
          requested_at?: Timestamp;
          updated_at?: Timestamp;
          fulfilled_at?: Timestamp | null;
        };
        Update: Partial<Database["public"]["Tables"]["hold_requests"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      restock_book: {
        Args: {
          p_book_id: string;
          p_quantity: number;
          p_supplier?: string;
          p_reference_number?: string;
          p_cost_per_book?: number;
          p_notes?: string;
          p_restock_date?: string;
        };
        Returns: string;
      };
      issue_book: {
        Args: {
          p_book_id: string;
          p_profile_id: string;
          p_quantity: number;
          p_expected_return_date?: string;
          p_notes?: string;
        };
        Returns: string;
      };
      return_book: {
        Args: {
          p_issue_id: string;
          p_quantity: number;
          p_condition?: ReturnCondition;
          p_notes?: string;
        };
        Returns: string;
      };
      upcoming_restocks: {
        Args: { p_limit?: number };
        Returns: {
          title: string;
          subject: string | null;
          quantity: number;
          restock_date: string;
        }[];
      };
      adjust_inventory: {
        Args: {
          p_book_id: string;
          p_quantity_change: number;
          p_reason: string;
          p_notes?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      role_name: RoleName;
      movement_type: MovementType;
      issue_status: IssueStatus;
      return_condition: ReturnCondition;
      hold_status: HoldStatus;
      chat_sender: ChatSender;
      profile_status: "ACTIVE" | "DISABLED";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  T extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][T]["Row"];
export type Profile = Tables<"profiles">;
export type Book = Tables<"books">;
export type Inventory = Tables<"inventory">;
export type Restock = Tables<"restocks">;
export type StockMovement = Tables<"stock_movements">;
export type BookIssue = Tables<"book_issues">;
export type BookReturn = Tables<"book_returns">;
export type Subject = Tables<"subjects">;
export type Strand = Tables<"strands">;
export type Semester = Tables<"semesters">;
export type YearLevel = Tables<"year_levels">;
export type Author = Tables<"authors">;
export type SavedBook = Tables<"saved_books">;
export type HoldRequest = Tables<"hold_requests">;
export type ChatMessage = Tables<"chat_messages">;
