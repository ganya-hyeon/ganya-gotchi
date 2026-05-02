import { create } from 'zustand';
import { client } from '@/lib/sanity';

export interface Project {
  id: string;
  cat: string;
  name: string;
  client: string;
  year: string;
  roles: string[];
  status: string;
  size: number;
  desc: {
    background: string;
    thinking: string;
    challenge: string;
  };
  outcomes: string[];
  meta: {
    period: string;
    team: string;
    tool: string;
  };
  thumbnail?: string;
}

interface FeedQuest {
  name: string;
  diff: string;
  reward: string;
  dialogs: string[];
}

interface GameState {
  level: number;
  projects: Project[];
  activeQuest: Project | null;
  experience: number;
  isEvolving: boolean;
  
  priorityDialogue: string | null;
  activeFeedQuest: FeedQuest | null;
  feedTrigger: number;
  activeTab: 'QUEST_LOG' | 'WORK' | 'FEED' | 'MENU' | 'STATUS' | 'LOGS';
  
  trackingX: number;
  trackingY: number;
  isPetting: boolean;
  isHovering: boolean;
  pettingIntensity: number;
  isWaving: boolean;
  isPinching: boolean;
  isTrackingLoading: boolean;
  isTrackingActive: boolean;
  isTutorialActive: boolean;
  tutorialStep: number;
  workViewMode: 'WORLD' | 'LIST' | 'GRID' | 'GALLERY';

  // Actions
  completeProject: (id: string) => void;
  setActiveQuest: (project: Project | null) => void;
  triggerEvolution: () => void;
  setPriorityDialogue: (message: string | null) => void;
  setFeedQuest: (quest: FeedQuest | null) => void;
  triggerFeeding: () => void;
  setActiveTab: (tab: 'QUEST_LOG' | 'WORK' | 'FEED' | 'MENU' | 'STATUS' | 'LOGS') => void;
  setTrackingCoords: (x: number, y: number) => void;
  setPetting: (isPetting: boolean, intensity: number) => void;
  setHovering: (isHovering: boolean) => void;
  setIsWaving: (isWaving: boolean) => void;
  setPinching: (isPinching: boolean) => void;
  setTrackingLoading: (isLoading: boolean) => void;
  setIsTrackingActive: (isActive: boolean) => void;
  setTutorialActive: (active: boolean) => void;
  setTutorialStep: (step: number) => void;
  setWorkViewMode: (mode: 'WORLD' | 'LIST' | 'GRID' | 'GALLERY') => void;
  fetchProjects: () => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
  level: 1,
  projects: [],
  activeQuest: null,
  experience: 0,
  isEvolving: false,
  priorityDialogue: null,
  activeFeedQuest: null,
  feedTrigger: 0,
  activeTab: 'QUEST_LOG',
  trackingX: 0,
  trackingY: 0,
  isPetting: false,
  isHovering: false,
  pettingIntensity: 0,
  isWaving: false,
  isPinching: false,
  isTrackingLoading: false,
  isTrackingActive: false,
  isTutorialActive: false,
  tutorialStep: 0,
  workViewMode: 'WORLD',

  completeProject: (id) => set((state) => {
    const updatedProjects = state.projects.map(p => p.id === id ? { ...p, status: 'done' } : p);
    const completedCount = updatedProjects.filter(p => p.status === 'done').length;
    
    let newLevel = state.level;
    let shouldEvolve = false;

    if (completedCount === 2 && state.level === 1) {
      newLevel = 2;
      shouldEvolve = true;
    }

    return { 
      projects: updatedProjects, 
      level: newLevel,
      isEvolving: shouldEvolve 
    };
  }),

  setActiveQuest: (project) => set({ activeQuest: project }),
  
  triggerEvolution: () => set({ isEvolving: false }),

  setPriorityDialogue: (message) => set({ priorityDialogue: message }),

  setFeedQuest: (quest) => set({ activeFeedQuest: quest }),

  triggerFeeding: () => set((state) => ({ feedTrigger: state.feedTrigger + 1 })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setTrackingCoords: (x, y) => set({ trackingX: x, trackingY: y }),

  setPetting: (isPetting, intensity) => set({ isPetting, pettingIntensity: intensity }),

  setHovering: (isHovering) => set({ isHovering }),

  setIsWaving: (isWaving) => set({ isWaving }),

  setPinching: (isPinching) => set({ isPinching }),

  setTrackingLoading: (isLoading) => set({ isTrackingLoading: isLoading }),

  setIsTrackingActive: (isActive) => set({ isTrackingActive: isActive }),

  setTutorialActive: (active) => set({ isTutorialActive: active }),

  setTutorialStep: (step) => set({ tutorialStep: step }),

  setWorkViewMode: (mode) => set({ workViewMode: mode }),

  fetchProjects: async () => {
    try {
      const query = `*[_type == "project"] | order(year desc)`;
      const data = await client.fetch(query);
      
      // Ensure the data structure matches our internal Project interface
      const mappedProjects: Project[] = data.map((p: any) => ({
        id: p.projectId || p._id,
        cat: p.cat || 'ux',
        name: p.name || 'Untitled',
        client: p.client || 'Unknown',
        year: p.year || '2024',
        roles: p.roles || [],
        status: p.status || 'wip',
        size: p.size || 3,
        desc: p.desc || { background: '', thinking: '', challenge: '' },
        outcomes: p.outcomes || [],
        meta: p.meta || { period: '', team: '', tool: '' },
        thumbnail: p.thumbnail || ''
      }));

      set({ projects: mappedProjects });
    } catch (error) {
      console.error('Failed to fetch projects from Sanity:', error);
    }
  }
}));
