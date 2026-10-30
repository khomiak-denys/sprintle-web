export interface IconDefinition {
  readonly viewBox?: string;
  readonly body: string;
}

export const ICONS = {
  // Navigation & Actions
  'arrow-left': {
    viewBox: '0 0 24 24',
    body: '<line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>',
  },
  'chevron-down': {
    viewBox: '0 0 24 24',
    body: '<polyline points="6 9 12 15 18 9"></polyline>',
  },
  'chevron-right': {
    viewBox: '0 0 24 24',
    body: '<polyline points="9 18 15 12 9 6"></polyline>',
  },
  plus: {
    viewBox: '0 0 24 24',
    body: '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
  },
  close: {
    viewBox: '0 0 24 24',
    body: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
  },
  check: {
    viewBox: '0 0 24 24',
    body: '<polyline points="20 6 9 17 4 12"></polyline>',
  },
  search: {
    viewBox: '0 0 24 24',
    body: '<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>',
  },
  refresh: {
    viewBox: '0 0 24 24',
    body: '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>',
  },
  'refresh-cw': {
    viewBox: '0 0 24 24',
    body: '<path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>',
  },
  filter: {
    viewBox: '0 0 24 24',
    body: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>',
  },
  trash: {
    viewBox: '0 0 24 24',
    body: '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>',
  },

  // Users & Auth
  user: {
    viewBox: '0 0 24 24',
    body: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  },
  users: {
    viewBox: '0 0 24 24',
    body: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  },
  'user-plus': {
    viewBox: '0 0 24 24',
    body: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line>',
  },
  logout: {
    viewBox: '0 0 24 24',
    body: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',
  },
  lock: {
    viewBox: '0 0 24 24',
    body: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
  },
  'lock-sm': {
    viewBox: '0 0 16 16',
    body: '<rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2" /><path d="M5 7V5C5 3.34 6.34 2 8 2C9.66 2 11 3.34 11 5V7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />',
  },
  eye: {
    viewBox: '0 0 16 16',
    body: '<path d="M2 8C2 8 4.5 3 8 3C11.5 3 14 8 14 8C14 8 11.5 13 8 13C4.5 13 2 8 2 8Z" stroke="currentColor" stroke-width="1.2" /><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2" />',
  },
  'eye-off': {
    viewBox: '0 0 16 16',
    body: '<path d="M2 8C2 8 4.5 3 8 3C11.5 3 14 8 14 8C14 8 11.5 13 8 13C4.5 13 2 8 2 8Z" stroke="currentColor" stroke-width="1.2" /><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2" /><path d="M3 13L13 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />',
  },
  mail: {
    viewBox: '0 0 24 24',
    body: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
  },

  // Organization & Layout
  admin: {
    viewBox: '0 0 24 24',
    body: '<rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line>',
  },
  workspace: {
    viewBox: '0 0 24 24',
    body: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
  },
  folder: {
    viewBox: '0 0 24 24',
    body: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>',
  },
  board: {
    viewBox: '0 0 24 24',
    body: '<rect x="3" y="3" width="5" height="18" rx="1"></rect><rect x="10" y="3" width="5" height="12" rx="1"></rect><rect x="17" y="3" width="5" height="15" rx="1"></rect>',
  },
  list: {
    viewBox: '0 0 24 24',
    body: '<line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>',
  },
  analytics: {
    viewBox: '0 0 24 24',
    body: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
  },
  settings: {
    viewBox: '0 0 24 24',
    body: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
  },
  calendar: {
    viewBox: '0 0 24 24',
    body: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>',
  },
  clock: {
    viewBox: '0 0 24 24',
    body: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>',
  },
  star: {
    viewBox: '0 0 24 24',
    body: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
  },
  'check-square': {
    viewBox: '0 0 24 24',
    body: '<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>',
  },
  'x-square': {
    viewBox: '0 0 24 24',
    body: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line>',
  },
  'x-circle': {
    viewBox: '0 0 24 24',
    body: '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',
  },
  send: {
    viewBox: '0 0 24 24',
    body: '<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
  },

  // Status & Warnings
  'alert-triangle': {
    viewBox: '0 0 24 24',
    body: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
  },
  'alert-circle': {
    viewBox: '0 0 24 24',
    body: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
  },
  'info-circle': {
    viewBox: '0 0 24 24',
    body: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
  },

  // Azure DevOps Work Item Types (Official Colors)
  'task-item': {
    viewBox: '0 0 24 24',
    body: '<g stroke="#f2c811" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2" ry="2" fill="#fff9db"></rect><line x1="8" y1="8" x2="16" y2="8"></line><line x1="8" y1="12" x2="16" y2="12"></line><polyline points="8 16 11 18 16 13"></polyline></g>',
  },
  'epic-item': {
    viewBox: '0 0 24 24',
    body: '<g stroke="#e69500" stroke-width="2" fill="#e69500"><path d="M3 19h18v2H3zM5 16l3-7 4 4 4-7 3 7H5z"></path></g>',
  },
  'feature-item': {
    viewBox: '0 0 24 24',
    body: '<g stroke="#773adc" stroke-width="2" fill="#773adc"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></g>',
  },
  'story-item': {
    viewBox: '0 0 24 24',
    body: '<g stroke="#009ccc" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#e5f5fa"></path><line x1="9" y1="7" x2="15" y2="7"></line><line x1="9" y1="11" x2="14" y2="11"></line></g>',
  },
  'bug-item': {
    viewBox: '0 0 24 24',
    body: '<g stroke="#cc293d" stroke-width="2" fill="#cc293d"><rect x="8" y="9" width="8" height="11" rx="4"></rect><path d="M12 5V9" fill="none"></path><path d="M5 11l3 1" fill="none"></path><path d="M19 11l-3 1" fill="none"></path><path d="M5 15h3" fill="none"></path><path d="M16 15h3" fill="none"></path><path d="M5 19l3-1" fill="none"></path><path d="M19 19l-3-1" fill="none"></path><path d="M9 5a3 3 0 0 1 6 0" fill="none"></path></g>',
  },

  // Jira Priorities (Official Colors)
  'priority-lowest': {
    viewBox: '0 0 24 24',
    body: '<g stroke="#2684ff" stroke-width="2.5" fill="none"><polyline points="7 6 12 11 17 6"></polyline><polyline points="7 13 12 18 17 13"></polyline></g>',
  },
  'priority-low': {
    viewBox: '0 0 24 24',
    body: '<g stroke="#0052cc" stroke-width="2.5" fill="none"><polyline points="6 9 12 15 18 9"></polyline></g>',
  },
  'priority-medium': {
    viewBox: '0 0 24 24',
    body: '<g stroke="#e27c00" stroke-width="2.5" fill="none"><line x1="5" y1="9" x2="19" y2="9"></line><line x1="5" y1="15" x2="19" y2="15"></line></g>',
  },
  'priority-high': {
    viewBox: '0 0 24 24',
    body: '<g stroke="#de350b" stroke-width="2.5" fill="none"><polyline points="18 15 12 9 6 15"></polyline></g>',
  },
  'priority-critical': {
    viewBox: '0 0 24 24',
    body: '<g stroke="#bf2600" stroke-width="2.5" fill="none"><polyline points="17 18 12 13 7 18"></polyline><polyline points="17 11 12 6 7 11"></polyline></g>',
  },
} as const;

export type IconName = keyof typeof ICONS;
