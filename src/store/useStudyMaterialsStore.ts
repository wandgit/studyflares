import { create } from 'zustand';
import { studyMaterialsService } from '../services/studyMaterialsService';
import { Database } from '../types/supabase';
import { toast } from 'react-hot-toast';

type StudyMaterial = Database['public']['Tables']['study_materials']['Row'];
type MaterialType = StudyMaterial['type'];

interface StudyMaterialsState {
  materials: StudyMaterial[];
  loading: boolean;
  error: string | null;
  selectedMaterial: StudyMaterial | null;
  fetchUserMaterials: (userId: string) => Promise<void>;
  fetchPublicMaterials: (subject?: string) => Promise<void>;
  createMaterial: (data: {
    title: string;
    content: string;
    type: MaterialType;
    subject: string;
    userId: string;
    isPublic?: boolean;
    metadata?: any;
  }) => Promise<StudyMaterial>;
  updateMaterial: (id: string, data: Partial<StudyMaterial>) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  setSelectedMaterial: (material: StudyMaterial | null) => void;
}

export const useStudyMaterialsStore = create<StudyMaterialsState>((set, get) => ({
  materials: [],
  loading: false,
  error: null,
  selectedMaterial: null,

  fetchUserMaterials: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const materials = await studyMaterialsService.getUserStudyMaterials(userId);
      set({ materials, loading: false });
    } catch (error: any) {
      console.error('Error fetching user materials:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to load study materials');
    }
  },

  fetchPublicMaterials: async (subject?: string) => {
    try {
      set({ loading: true, error: null });
      const materials = await studyMaterialsService.getPublicStudyMaterials(subject);
      set({ materials, loading: false });
    } catch (error: any) {
      console.error('Error fetching public materials:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to load public study materials');
    }
  },

  createMaterial: async (data) => {
    try {
      set({ loading: true, error: null });
      const material = await studyMaterialsService.createStudyMaterial({
        title: data.title,
        content: data.content,
        type: data.type,
        subject: data.subject,
        user_id: data.userId,
        is_public: data.isPublic ?? false,
        metadata: data.metadata ?? {},
      });
      
      set((state) => ({
        materials: [material, ...state.materials],
        loading: false,
      }));
      
      toast.success('Study material created successfully');
      return material;
    } catch (error: any) {
      console.error('Error creating study material:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to create study material');
      throw error;
    }
  },

  updateMaterial: async (id: string, data) => {
    try {
      set({ loading: true, error: null });
      const updated = await studyMaterialsService.updateStudyMaterial(id, data);
      
      set((state) => ({
        materials: state.materials.map((m) => (m.id === id ? updated : m)),
        selectedMaterial: state.selectedMaterial?.id === id ? updated : state.selectedMaterial,
        loading: false,
      }));
      
      toast.success('Study material updated successfully');
    } catch (error: any) {
      console.error('Error updating study material:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to update study material');
    }
  },

  deleteMaterial: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await studyMaterialsService.deleteStudyMaterial(id);
      
      set((state) => ({
        materials: state.materials.filter((m) => m.id !== id),
        selectedMaterial: state.selectedMaterial?.id === id ? null : state.selectedMaterial,
        loading: false,
      }));
      
      toast.success('Study material deleted successfully');
    } catch (error: any) {
      console.error('Error deleting study material:', error);
      set({ error: error.message, loading: false });
      toast.error('Failed to delete study material');
    }
  },

  setSelectedMaterial: (material) => {
    set({ selectedMaterial: material });
  },
}));
