export interface Message {
    id: string;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'FILE';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    senderId: string;
    receiverId?: string;
    createdAt: string;
    sender: {
        id: string;
        username: string;
        profileImage?: string;
    };
    receiver?: {
        id: string;
        username: string;
        profileImage?: string;
    };
    isSending?: boolean;
}
