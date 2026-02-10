export type UserRole = 'passenger' | 'driver';

export type Route = 'HN-HP' | 'HN-QN' | 'QN-HP';

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  post_type: 'offer' | 'request';
  routes: Route[];
  details: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}
