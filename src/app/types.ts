export enum SvenDirection {
    Up = 'Up',
    Down = 'Down',
}

export interface SvenResponse {
    success: boolean;
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    data?: any;
    error?: string;
    timestamp: string;
}

