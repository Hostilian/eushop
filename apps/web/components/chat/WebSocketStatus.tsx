"use client";

import React, { useState, useEffect } from 'react';
import { websocketService } from '../../lib/services/websocketService';
import { Tooltip } from '../ui/Tooltip';

export const WebSocketStatus: React.FC = () => {
  const [connected, setConnected] = useState(() => websocketService.isConnected());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Register callbacks
    const handleConnection = () => {
      setConnected(true);
      setError(null);
    };

    const handleError = (data: any) => {
      setConnected(false);
      setError(data.error || 'WebSocket connection error');
    };

    websocketService.onConnection(handleConnection);
    websocketService.onError(handleError);

    return () => {
      websocketService.offConnection(handleConnection);
      websocketService.offError(handleError);
    };
  }, []);

  const getStatusText = () => {
    if (error) return 'Disconnected (retrying...)';
    if (connected) return 'Connected';
    return 'Connecting...';
  };

  const getStatusColor = () => {
    if (error) return 'bg-red-500';
    if (connected) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  return (
    <Tooltip content={`Chat: ${getStatusText()}`}>
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}></div>
        <span className="text-xs text-gray-500">{getStatusText()}</span>
      </div>
    </Tooltip>
  );
};
