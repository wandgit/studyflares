import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConceptMap, QuizQuestion, Exam } from '../services/geminiService';

export interface SavedStudyMaterial {
  id: string;
  fileName: string;
  dateAdded: string;
  studyGuide: string;
  flashcards: Array<{ question: string; answer: string }>;
  quiz: Array<QuizQuestion>;
  conceptMap: ConceptMap;
  exam?: Exam;
}

interface StudyLibraryState {
  savedMaterials: SavedStudyMaterial[];
  addMaterial: (material: Omit<SavedStudyMaterial, 'id' | 'dateAdded'>) => void;
  removeMaterial: (id: string) => void;
  getMaterial: (id: string) => SavedStudyMaterial | undefined;
}

const useStudyLibraryStore = create<StudyLibraryState>()(
  persist(
    (set, get) => ({
      savedMaterials: [],
      
      addMaterial: (material) => {
        const newMaterial: SavedStudyMaterial = {
          ...material,
          id: crypto.randomUUID(),
          dateAdded: new Date().toISOString(),
        };
        
        set((state) => ({
          savedMaterials: [...state.savedMaterials, newMaterial],
        }));
      },
      
      removeMaterial: (id) => {
        set((state) => ({
          savedMaterials: state.savedMaterials.filter((m) => m.id !== id),
        }));
      },
      
      getMaterial: (id) => {
        return get().savedMaterials.find((m) => m.id === id);
      },
    }),
    {
      name: 'study-library-storage',
    }
  )
);

export default useStudyLibraryStore;
