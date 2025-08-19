export enum SvenCommand {
    UpDuration = 'UpDuration',
    DownDuration = 'DownDuration',
    UpRelative = 'UpRelative',
    DownRelative = 'DownRelative',
    AbsoluteHeight = 'AbsoluteHeight',
    Position = 'Position',
}

export interface SvenResponse {
    success: boolean;
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    data?: any;
    error?: string;
    timestamp: string;
}

