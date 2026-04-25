export interface Draft {
  id: string;
  title: string;
  body: string;
  date: string;
  status?: 'working' | 'ready';
  tags?: string;
}

export interface Template {
  id: string;
  name: string;
  content: string;
  title?: string;
  tags?: string;
}

export interface ImageItem {
  url: string;
  name: string;
  selected?: boolean;
  exif?: string;
}

export interface TagGroup {
  id: string;
  name: string;
  tags: string[];
}

export type Language = 'uk' | 'en' | 'es' | 'ko';

export type AuthType = 'KEYCHAIN' | 'VAULT';

export interface QueueItem {
  id: string;
  title: string;
  body: string;
  tags: string;
  authType: AuthType;
  username: string;
  selectedVaultUser: string;
  scheduledTime?: string;
  status: 'pending' | 'published' | 'error';
  error?: string;
}
