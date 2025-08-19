export enum SvenCommand {
    UpDuration = 'UpDuration',
    DownDuration = 'DownDuration',
    UpRelative = "UpRelative",
    DownRelative = "DownRelative",
    AbsoluteHeight = "AbsoluteHeight",
    Position = "Position",
}

export enum SvenMoveMode {
    Duration,
    Relative,
    Absolute,
    Position
}

export enum SvenPosition {
    Bottom,
    Top,
    ArmRest,
    AboveArmrest,
    Standing,
    Custom
}

export enum SvenDirection {
    Up,
    Down
}

export interface SvenResponse {
    success: boolean;
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    data?: any;
    error?: string;
    timestamp: string;
}

