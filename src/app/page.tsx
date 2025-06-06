'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Clock, Send } from 'lucide-react';

export default function MotorControlApp() {
    const [selectedDirection, setSelectedDirection] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(null);
    const [showDurations, setShowDurations] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastResponse, setLastResponse] = useState(null);

    const durations = [
        { label: '100ms', value: 100 },
        { label: '250ms', value: 250 },
        { label: '500ms', value: 500 },
        { label: '1 second', value: 1000 },
        { label: '2 seconds', value: 2000 },
        { label: '5 seconds', value: 5000 },
        { label: '10 seconds', value: 10000 }
    ];

    const handleDirectionClick = (direction) => {
        setSelectedDirection(direction);
        setShowDurations(true);
        setSelectedDuration(null);
    };

    const handleDurationSelect = (duration) => {
        setSelectedDuration(duration);
    };

    const sendCommand = async () => {
        if (!selectedDirection || !selectedDuration) return;

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/motor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    direction: selectedDirection,
                    duration: selectedDuration
                })
            });

            const result = await response.json();
            setLastResponse({
                success: response.ok,
                data: result,
                timestamp: new Date().toLocaleTimeString()
            });
        } catch (error) {
            setLastResponse({
                success: false,
                error: error.message,
                timestamp: new Date().toLocaleTimeString()
            });
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setSelectedDirection(null);
        setSelectedDuration(null);
        setShowDurations(false);
        setLastResponse(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Motor Control</h1>
                        <p className="text-slate-300">Select direction and duration</p>
                    </div>

                    {/* Main Control Panel */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">

                        {/* Direction Buttons */}
                        {!showDurations && (
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-white mb-4">Choose Direction</h2>
                                <button
                                    onClick={() => handleDirectionClick('Up')}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3"
                                >
                                    <ChevronUp size={24} />
                                    UP
                                </button>
                                <button
                                    onClick={() => handleDirectionClick('Down')}
                                    className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3"
                                >
                                    <ChevronDown size={24} />
                                    DOWN
                                </button>
                            </div>
                        )}

                        {/* Duration Selection */}
                        {showDurations && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-white">Duration for {selectedDirection}</h2>
                                    <button
                                        onClick={reset}
                                        className="text-slate-300 hover:text-white text-sm underline"
                                    >
                                        Change Direction
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {durations.map((duration) => (
                                        <button
                                            key={duration.value}
                                            onClick={() => handleDurationSelect(duration.value)}
                                            className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${selectedDuration === duration.value
                                                ? 'border-blue-400 bg-blue-500/20 text-blue-200'
                                                : 'border-white/20 bg-white/5 text-slate-300 hover:border-white/40 hover:bg-white/10'
                                                }`}
                                        >
                                            <Clock size={16} />
                                            {duration.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Send Button */}
                                {selectedDuration && (
                                    <button
                                        onClick={sendCommand}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-500 disabled:to-slate-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3 mt-6"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={20} />
                                                Send Command
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Response Status */}
                        {lastResponse && (
                            <div className={`mt-6 p-4 rounded-lg border-2 ${lastResponse.success
                                ? 'border-green-400 bg-green-500/20 text-green-200'
                                : 'border-red-400 bg-red-500/20 text-red-200'
                                }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${lastResponse.success ? 'bg-green-400' : 'bg-red-400'
                                        }`}></div>
                                    <span className="font-semibold">
                                        {lastResponse.success ? 'Success' : 'Error'}
                                    </span>
                                    <span className="text-xs opacity-75 ml-auto">
                                        {lastResponse.timestamp}
                                    </span>
                                </div>
                                <div className="text-sm font-mono">
                                    {lastResponse.success
                                        ? `Sent: ${selectedDirection} for ${selectedDuration}ms`
                                        : `Failed: ${lastResponse.error}`
                                    }
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Panel */}
                    <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <h3 className="text-white font-semibold mb-2">API Endpoint</h3>
                        <p className="text-slate-300 text-sm font-mono">POST http://localhost:3000/api/motor</p>
                        <p className="text-slate-400 text-xs mt-2">
                            Sends JSON: {`{direction: "Up|Down", duration: milliseconds}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
