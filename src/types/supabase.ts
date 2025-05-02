export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      study_materials: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          type: 'study_guide' | 'flashcards' | 'quiz' | 'concept_map' | 'exam'
          subject: string
          user_id: string
          is_public: boolean
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          type: 'study_guide' | 'flashcards' | 'quiz' | 'concept_map' | 'exam'
          subject: string
          user_id: string
          is_public?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          type?: 'study_guide' | 'flashcards' | 'quiz' | 'concept_map' | 'exam'
          subject?: string
          user_id?: string
          is_public?: boolean
          metadata?: Json
        }
      }
      exam_results: {
        Row: {
          id: string
          created_at: string
          user_id: string
          study_material_id: string
          score: number
          total_questions: number
          time_taken: number
          answers: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          study_material_id: string
          score: number
          total_questions: number
          time_taken: number
          answers: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          study_material_id?: string
          score?: number
          total_questions?: number
          time_taken?: number
          answers?: Json
        }
      }
      activity_history: {
        Row: {
          id: string
          created_at: string
          user_id: string
          activity_type: 'study' | 'quiz' | 'upload'
          study_material_id: string | null
          exam_result_id: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          activity_type: 'study' | 'quiz' | 'upload'
          study_material_id?: string | null
          exam_result_id?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          activity_type?: 'study' | 'quiz' | 'upload'
          study_material_id?: string | null
          exam_result_id?: string | null
          metadata?: Json
        }
      }
      community_posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          content: string
          study_material_id: string | null
          likes: number
          comments_count: number
          is_pinned: boolean
          tags: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          content: string
          study_material_id?: string | null
          likes?: number
          comments_count?: number
          is_pinned?: boolean
          tags?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          content?: string
          study_material_id?: string | null
          likes?: number
          comments_count?: number
          is_pinned?: boolean
          tags?: string[]
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          post_id: string
          content: string
          likes: number
          parent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          post_id: string
          content: string
          likes?: number
          parent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          post_id?: string
          content?: string
          likes?: number
          parent_id?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          updated_at: string
          name: string | null
          school: string | null
          avatar_url: string | null
          email: string
        }
        Insert: {
          id: string
          updated_at?: string
          name?: string | null
          school?: string | null
          avatar_url?: string | null
          email: string
        }
        Update: {
          id?: string
          updated_at?: string
          name?: string | null
          school?: string | null
          avatar_url?: string | null
          email?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
