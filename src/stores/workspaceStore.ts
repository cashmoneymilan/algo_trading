import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define our own layout item type for the workspace
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
}

interface WorkspaceWidget {
  id: string;
  type:
    | 'chart'
    | 'order-book'
    | 'order-book-3d'
    | 'positions'
    | 'orders'
    | 'order-entry'
    | 'watchlist'
    | 'account'
    | 'treemap'
    | 'news';
  config: Record<string, unknown>;
}

interface Workspace {
  id: string;
  name: string;
  layout: LayoutItem[];
  widgets: WorkspaceWidget[];
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceState {
  // Workspaces
  workspaces: Workspace[];
  activeWorkspaceId: string | null;

  // Current layout (may differ from saved workspace)
  currentLayout: LayoutItem[];
  currentWidgets: WorkspaceWidget[];
  isDirty: boolean;

  // Actions
  createWorkspace: (name: string) => string;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  duplicateWorkspace: (id: string) => string;
  setActiveWorkspace: (id: string) => void;
  saveCurrentWorkspace: () => void;
  discardChanges: () => void;

  // Layout actions
  updateLayout: (layout: LayoutItem[]) => void;
  addWidget: (widget: Omit<WorkspaceWidget, 'id'>, layout: Omit<LayoutItem, 'i'>) => void;
  removeWidget: (widgetId: string) => void;
  updateWidgetConfig: (widgetId: string, config: Record<string, unknown>) => void;

  // Reset
  resetToDefault: () => void;
}

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: 'chart', x: 0, y: 0, w: 8, h: 6 },
  { i: 'order-book', x: 8, y: 0, w: 4, h: 4 },
  { i: 'order-entry', x: 8, y: 4, w: 4, h: 4 },
  { i: 'positions', x: 0, y: 6, w: 6, h: 4 },
  { i: 'orders', x: 6, y: 6, w: 6, h: 4 },
];

const DEFAULT_WIDGETS: WorkspaceWidget[] = [
  { id: 'chart', type: 'chart', config: { symbol: 'AAPL' } },
  { id: 'order-book', type: 'order-book', config: { symbol: 'AAPL' } },
  { id: 'order-entry', type: 'order-entry', config: { symbol: 'AAPL' } },
  { id: 'positions', type: 'positions', config: {} },
  { id: 'orders', type: 'orders', config: {} },
];

const DEFAULT_WORKSPACE: Workspace = {
  id: 'default',
  name: 'Default',
  layout: DEFAULT_LAYOUT,
  widgets: DEFAULT_WIDGETS,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

function generateId(): string {
  return `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [DEFAULT_WORKSPACE],
      activeWorkspaceId: 'default',
      currentLayout: DEFAULT_LAYOUT,
      currentWidgets: DEFAULT_WIDGETS,
      isDirty: false,

      createWorkspace: (name) => {
        const id = generateId();
        const now = Date.now();
        const workspace: Workspace = {
          id,
          name,
          layout: [...get().currentLayout],
          widgets: [...get().currentWidgets],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          activeWorkspaceId: id,
          isDirty: false,
        }));
        return id;
      },

      deleteWorkspace: (id) => {
        const state = get();
        if (state.workspaces.length <= 1) return; // Can't delete last workspace

        const newWorkspaces = state.workspaces.filter((ws) => ws.id !== id);
        const newActiveId =
          state.activeWorkspaceId === id
            ? newWorkspaces[0].id
            : state.activeWorkspaceId;

        const activeWorkspace = newWorkspaces.find((ws) => ws.id === newActiveId);
        set({
          workspaces: newWorkspaces,
          activeWorkspaceId: newActiveId,
          currentLayout: activeWorkspace?.layout || DEFAULT_LAYOUT,
          currentWidgets: activeWorkspace?.widgets || DEFAULT_WIDGETS,
          isDirty: false,
        });
      },

      renameWorkspace: (id, name) => {
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === id ? { ...ws, name, updatedAt: Date.now() } : ws
          ),
        }));
      },

      duplicateWorkspace: (id) => {
        const workspace = get().workspaces.find((ws) => ws.id === id);
        if (!workspace) return '';

        const newId = generateId();
        const now = Date.now();
        const newWorkspace: Workspace = {
          ...workspace,
          id: newId,
          name: `${workspace.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
        }));
        return newId;
      },

      setActiveWorkspace: (id) => {
        const workspace = get().workspaces.find((ws) => ws.id === id);
        if (!workspace) return;

        set({
          activeWorkspaceId: id,
          currentLayout: [...workspace.layout],
          currentWidgets: [...workspace.widgets],
          isDirty: false,
        });
      },

      saveCurrentWorkspace: () => {
        const { activeWorkspaceId, currentLayout, currentWidgets } = get();
        if (!activeWorkspaceId) return;

        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === activeWorkspaceId
              ? {
                  ...ws,
                  layout: currentLayout,
                  widgets: currentWidgets,
                  updatedAt: Date.now(),
                }
              : ws
          ),
          isDirty: false,
        }));
      },

      discardChanges: () => {
        const workspace = get().workspaces.find(
          (ws) => ws.id === get().activeWorkspaceId
        );
        if (!workspace) return;

        set({
          currentLayout: [...workspace.layout],
          currentWidgets: [...workspace.widgets],
          isDirty: false,
        });
      },

      updateLayout: (layout) => {
        set({ currentLayout: layout, isDirty: true });
      },

      addWidget: (widget, layout) => {
        const id = `widget-${Date.now()}`;
        set((state) => ({
          currentWidgets: [...state.currentWidgets, { ...widget, id }],
          currentLayout: [...state.currentLayout, { ...layout, i: id }],
          isDirty: true,
        }));
      },

      removeWidget: (widgetId) => {
        set((state) => ({
          currentWidgets: state.currentWidgets.filter((w) => w.id !== widgetId),
          currentLayout: state.currentLayout.filter((l) => l.i !== widgetId),
          isDirty: true,
        }));
      },

      updateWidgetConfig: (widgetId, config) => {
        set((state) => ({
          currentWidgets: state.currentWidgets.map((w) =>
            w.id === widgetId ? { ...w, config: { ...w.config, ...config } } : w
          ),
          isDirty: true,
        }));
      },

      resetToDefault: () => {
        set({
          workspaces: [DEFAULT_WORKSPACE],
          activeWorkspaceId: 'default',
          currentLayout: DEFAULT_LAYOUT,
          currentWidgets: DEFAULT_WIDGETS,
          isDirty: false,
        });
      },
    }),
    {
      name: 'trading-workspaces',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selectors
export const selectActiveWorkspace = (state: WorkspaceState) =>
  state.workspaces.find((ws) => ws.id === state.activeWorkspaceId);

export const selectWorkspaces = (state: WorkspaceState) => state.workspaces;
export const selectCurrentLayout = (state: WorkspaceState) => state.currentLayout;
export const selectCurrentWidgets = (state: WorkspaceState) => state.currentWidgets;
export const selectIsDirty = (state: WorkspaceState) => state.isDirty;
