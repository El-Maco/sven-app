'use client';

import { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { SvenCommand, SvenMoveMode, SvenDirection, SvenResponse } from './types';
import dotenv from 'dotenv';
dotenv.config();

const apiBaseUrl = `http://${process.env.NEXT_PUBLIC_SVEN_API_URL || 'localhost'}`;
const apiPort = 3001;
const svenCommandEndpoint = `${apiBaseUrl}:${apiPort}/api/sven/command`;

const MODES = ['Duration', 'Relative', 'Absolute', 'Position'] as const;
const SVEN_POSITIONS = ['Bottom', 'Top', 'Arm Rest', 'Above Armrest', 'Standing'] as const;
const DURATIONS = [
    { label: '1 s', value: 1000 },
    { label: '2 s', value: 2000 },
    { label: '5 s', value: 5000 },
    { label: '10 s', value: 10000 },
    { label: '15 s', value: 15000 }
];
const DISTANCES = [
    { label: '1 cm', value: 1 },
    { label: '2 cm', value: 2 },
    { label: '5 cm', value: 5 },
    { label: '10 cm', value: 10 },
    { label: '15 cm', value: 15 },
    { label: '20 cm', value: 20 },
    { label: '25 cm', value: 25 },
    { label: '30 cm', value: 30 }
]

const statusTimeout = 5000;

export default function MotorControlApp() {
    const [selectedValue, setSelectedValue] = useState<number>(0);
    const [selectedDirection, setSelectedDirection] = useState<SvenDirection>(SvenDirection.Up);
    const [showSvenDirectionButtons, setShowSvenDirectionButtons] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [responseNotification, setResponseNotification] = useState<SvenResponse | null>(null);
    const [statusTimeoutId, setStatusTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const [selectedMode, setSelectedMode] = useState<SvenMoveMode>(SvenMoveMode.Duration);
    const [currentSvenState, setCurrentSvenState] = useState<SvenResponse | null>(null);

    useEffect(() => {
        const fetchSvenState = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}:${apiPort}/api/sven/state`);
                if (!response.ok) {
                    throw new Error(`Error fetching Sven state: ${response.statusText}`);
                }
                const svenState = await response.json();
                setCurrentSvenState(svenState);
                setSelectedValue(svenState.height_mm || 0); // Set initial value based on Sven state
            } catch (error) {
                console.error('Failed to fetch Sven state:', error);
            }
        };

        // Fetch Sven state on mount
        fetchSvenState();

        // Set up interval to refresh Sven state every 10 seconds
        const intervalId = setInterval(fetchSvenState, 10000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [])

    const clearNotifications = () => {
        if (statusTimeoutId) {
            clearTimeout(statusTimeoutId);
            setStatusTimeoutId(null);
        }
        setResponseNotification(null);
    }

    const handleDirectionClick = (direction: SvenDirection) => {
        clearNotifications();
        setSelectedDirection(direction);
        setShowSvenDirectionButtons(true);
        setSelectedValue(0);
    };

    const getSelectedSvenCommand = (moveMode: SvenMoveMode) => {
        if (moveMode === SvenMoveMode.Duration) {
            return selectedDirection === SvenDirection.Up ? SvenCommand.UpDuration : SvenCommand.DownDuration;
        } else if (moveMode === SvenMoveMode.Relative) {
            return selectedDirection === SvenDirection.Up ? SvenCommand.UpRelative : SvenCommand.DownRelative;
        } else if (moveMode === SvenMoveMode.Absolute) {
            return SvenCommand.AbsoluteHeight;
        } else if (moveMode === SvenMoveMode.Position) {
            return SvenCommand.Position;
        }
        return null;
    }
    const sendCommand = async (value: number, svenMoveMode?: SvenMoveMode) => {
        setIsLoading(true);
        const moveMode = svenMoveMode ?? selectedMode
        try {
            const body = { command: getSelectedSvenCommand(moveMode), value };
            console.log('Sending command:', body);
            const response = await fetch(svenCommandEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
            const result = await response.json();
            setResponseNotification({
                success: response.ok,
                data: result,
                timestamp: new Date().toLocaleTimeString()
            });
            if (statusTimeoutId) {
                clearTimeout(statusTimeoutId);
            }
            setStatusTimeoutId(
                setTimeout(() => {
                    setResponseNotification(null);
                }, statusTimeout)
            )
            /* eslint-disable  @typescript-eslint/no-explicit-any */
        } catch (error: any) {
            setResponseNotification({
                success: false,
                error: error.message,
                timestamp: new Date().toLocaleTimeString()
            });
        } finally {
            setIsLoading(false);
        }
        reset();
    };

    const reset = () => {
        setShowSvenDirectionButtons(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Sven Motor Control</h1>
                        <p className="text-slate-300">Select direction and duration</p>
                    </div>

                    {/* Response Status */}
                    {responseNotification && (
                        <div className={`fixed mt-6 p-4 top-6 right-6 z-50 min-w-[300px] rounded-lg border-2 max-w-sm opacity-100 cursor-pointer
                                ${responseNotification.success ? 'border-green-400 bg-green-500/80 text-green-200'
                                : 'border-red-400 bg-red-500/80 text-red-200'
                            }`}
                            onClick={clearNotifications}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${responseNotification.success ? 'bg-green-400' : 'bg-red-400'
                                    }`}></div>
                                <span className="font-semibold">
                                    {responseNotification.success ? 'Success' : 'Error'}
                                </span>
                                <span className="text-xs opacity-75 ml-auto">
                                    {responseNotification.timestamp}
                                </span>
                            </div>
                            <div className="text-sm font-mono">
                                {responseNotification.success
                                    ? `Sent: Command sent successfully`
                                    : `Failed: ${responseNotification.error}`
                                }
                            </div>
                        </div>
                    )}

                    {/* Main Control Panel */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">

                        <div className="space-y-4">
                            <div className="flex flex-row items-center justify-center gap-3 mb-4">
                                <button
                                    className={`px-4 py-2 rounded-lg ${selectedMode === SvenMoveMode.Relative ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                                    onClick={() => setSelectedMode(SvenMoveMode.Relative)}
                                >
                                    Distance
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg ${selectedMode === SvenMoveMode.Duration ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                                    onClick={() => setSelectedMode(SvenMoveMode.Duration)}
                                >
                                    Duration
                                </button>
                            </div>

                            {/* RELATIVE */}
                            {!showSvenDirectionButtons && (
                                <>
                                    <h2 className="text-lg font-semibold text-white mb-4">Move in a direction</h2>
                                    <button
                                        onClick={() => handleDirectionClick(SvenDirection.Up)}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3"
                                    >
                                        <ChevronUp size={24} />
                                        UP
                                    </button>
                                    <button
                                        onClick={() => handleDirectionClick(SvenDirection.Down)}
                                        className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3"
                                    >
                                        <ChevronDown size={24} />
                                        DOWN
                                    </button>
                                </>
                            )}

                            {showSvenDirectionButtons && (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-white">{SvenMoveMode[selectedMode]} move</h2>
                                        <button
                                            onClick={reset}
                                            className="text-slate-300 hover:text-white text-sm underline"
                                        >
                                            Change Direction
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {(selectedMode === SvenMoveMode.Duration ? DURATIONS : DISTANCES).map((currDuration) => (
                                            <button
                                                key={currDuration.value}
                                                onClick={() => sendCommand(currDuration.value)}
                                                disabled={isLoading}
                                                className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${selectedValue === currDuration.value
                                                    ? 'border-blue-400 bg-blue-500/20 text-blue-200'
                                                    : 'border-white/20 bg-white/5 text-slate-300 hover:border-white/40 hover:bg-white/10'
                                                    }`}
                                            >
                                                <Clock size={16} />
                                                {currDuration.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-6 border border-white/20 shadow-2xl">

                        {/* POSITION */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white">Move to a position</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {SVEN_POSITIONS.map((currentPosition, index) => (
                                    <button
                                        key={currentPosition}
                                        onClick={() => sendCommand(index, SvenMoveMode.Position)}
                                        disabled={isLoading}
                                        className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${selectedValue === index
                                            ? 'border-blue-400 bg-blue-500/20 text-blue-200'
                                            : 'border-white/20 bg-white/5 text-slate-300 hover:border-white/40 hover:bg-white/10'
                                            }`}
                                    >
                                        <Clock size={16} />
                                        {currentPosition}
                                    </button>
                                ))}
                            </div>

                            {/* ABSOLUTE */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-white">Move Absolute</h2>
                            </div>
                            <form
                                className="flex gap-3 items-center"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    console.log("Moving to absolute position:", selectedValue);
                                    sendCommand(selectedValue, SvenMoveMode.Absolute);
                                }}
                            >
                                <input
                                    type="range"
                                    min={622}
                                    max={1274}
                                    value={selectedValue}
                                    onChange={e => setSelectedValue(Number(e.target.value))}
                                    disabled={isLoading}
                                    className="flex-1 p-3 rounded-lg border-2 border-white/20 bg-white/5 text-slate-300 focus:border-blue-400 focus:bg-white/10 transition-all duration-200"
                                    placeholder="Enter position in cm"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !selectedValue}
                                    className="p-3 rounded-lg border-2 border-blue-400 bg-blue-500/20 text-blue-200 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <Clock size={16} />
                                    Set to {(selectedValue / 10).toFixed(1)} cm
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <h3 className="text-white font-semibold mb-2">API Endpoint</h3>
                        <p className="text-slate-300 text-sm font-mono">POST {svenCommandEndpoint}</p>
                        <p className="text-slate-400 text-xs mt-2">
                            Sends JSON: {`{command: "UpDuration|DownDuration", value: milliseconds}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
