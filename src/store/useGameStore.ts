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

interface SanityProject {
  _id: string;
  projectId?: string;
  cat?: string;
  name?: string;
  client?: string;
  year?: string;
  roles?: string[];
  status?: string;
  size?: number;
  desc?: {
    background: string;
    thinking: string;
    challenge: string;
  };
  outcomes?: string[];
  meta?: {
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
  feedCount: number;
  
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
  isLoading: boolean;
  error: string | null;

  // Actions
  completeProject: (id: string) => void;
  setActiveQuest: (project: Project | null) => void;
  triggerEvolution: () => void;
  setPriorityDialogue: (message: string | null) => void;
  setFeedQuest: (quest: FeedQuest | null) => void;
  spawnFood: () => void;
  incrementFeedCount: () => void;
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
  feedCount: 0,
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
  isLoading: false,
  error: null,

  completeProject: (id) => set((state) => {
    const updatedProjects = state.projects.map(p => p.id === id ? { ...p, status: 'done' } : p);
    
    return { 
      projects: updatedProjects
    };
  }),

  setActiveQuest: (project) => set({ activeQuest: project }),
  
  triggerEvolution: () => set({ isEvolving: false }),

  setPriorityDialogue: (message) => set({ priorityDialogue: message }),

  setFeedQuest: (quest) => set({ activeFeedQuest: quest }),

  spawnFood: () => set((state) => ({ feedTrigger: state.feedTrigger + 1 })),

  incrementFeedCount: () => set((state) => {
    const newFeedCount = state.feedCount + 1;
    let newLevel = state.level;
    let shouldEvolve = false;

    // 정확히 3번 먹었을 때만 진화 체크 (Lv.1 -> Lv.2)
    if (newFeedCount >= 3 && state.level === 1) {
      newLevel = 2;
      shouldEvolve = true;
    }

    return { 
      feedCount: newFeedCount,
      level: newLevel,
      isEvolving: shouldEvolve
    };
  }),

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
    set({ isLoading: true, error: null });
    try {
      const query = `*[_type == "project"] | order(year desc)`;
      const data = await client.fetch(query);
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data received from Sanity');
      }

      const mappedProjects: Project[] = data.map((p: SanityProject) => ({
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

      set({ projects: mappedProjects, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch projects from Sanity:', error);
      set({ error: 'Failed to fetch projects', isLoading: false });
    }
  }
}));
