export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      polls: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'active' | 'inactive' | 'expired'
          is_public: boolean
          allow_multiple_votes: boolean
          expires_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'active' | 'inactive' | 'expired'
          is_public?: boolean
          allow_multiple_votes?: boolean
          expires_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'active' | 'inactive' | 'expired'
          is_public?: boolean
          allow_multiple_votes?: boolean
          expires_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      poll_options: {
        Row: {
          id: string
          poll_id: string
          text: string
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          text: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          text?: string
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          }
        ]
      }
      votes: {
        Row: {
          id: string
          poll_id: string
          option_id: string
          voter_id: string | null
          voter_email: string | null
          voter_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          option_id: string
          voter_id?: string | null
          voter_email?: string | null
          voter_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          poll_id?: string
          option_id?: string
          voter_id?: string | null
          voter_email?: string | null
          voter_name?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      poll_shares: {
        Row: {
          id: string
          poll_id: string
          share_code: string
          is_active: boolean
          created_by: string
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          poll_id: string
          share_code: string
          is_active?: boolean
          created_by: string
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          poll_id?: string
          share_code?: string
          is_active?: boolean
          created_by?: string
          created_at?: string
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_shares_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_shares_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_poll_results: {
        Args: {
          poll_uuid: string
        }
        Returns: {
          option_id: string
          option_text: string
          vote_count: number
          percentage: number
        }[]
      }
      can_user_vote: {
        Args: {
          poll_uuid: string
          user_uuid?: string
        }
        Returns: boolean
      }
      generate_share_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      poll_status: 'active' | 'inactive' | 'expired'
      vote_type: 'single' | 'multiple'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Poll = Database['public']['Tables']['polls']['Row']
export type PollOption = Database['public']['Tables']['poll_options']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type PollShare = Database['public']['Tables']['poll_shares']['Row']

export type PollWithResults = Poll & {
  options: (PollOption & {
    vote_count: number
    percentage: number
  })[]
}

export type PollWithOptions = Poll & {
  poll_options: {
    id: string
    text: string
    order_index: number
  }[]
  profiles?: {
    name: string
  }
}

export type PollWithVoteCounts = Poll & {
  poll_options: {
    id: string
    text: string
    order_index: number
    vote_count: number
  }[]
  profiles?: {
    name: string
  }
}

export type CreatePollData = {
  title: string
  description?: string
  is_public?: boolean
  allow_multiple_votes?: boolean
  expires_at?: string
  options: string[]
}

export type EditPollFormData = {
  title: string
  description: string
  is_public: boolean
  allow_multiple_votes: boolean
  expires_at?: string
  options: string[]
}

export type VoteData = {
  poll_id: string
  option_id: string
  voter_email?: string
  voter_name?: string
}

export interface EditPollData {
  id: string;
  title: string;
  description: string | null;
  options: string[];
  is_public: boolean;
  allow_multiple_votes: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}
