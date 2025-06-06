export enum SvenDirection {
    Up = 'Up',
    Down = 'Down',
}

export interface SvenResponse {
    success: boolean;
    data?: any;
    error?: string;
    timestamp: string;
}

