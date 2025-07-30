export interface User {
    id: string;
    username: string;
    profileImage?: string;
    status?: 'online' | 'offline' | 'away';
    lastSeen?: string;
}