"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { websocketService } from '../../lib/services/websocketService';

import { MessageReaction } from '../../lib/services/chatService';

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  onAddReaction?: (reaction: string) => void;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = [],
  onAddReaction,
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const commonReactions = ['👍', '❤️', '😊', '😢', '😮', '🔥'];

  const handleAddReaction = async (reaction: string) => {
    try {
      setIsAdding(true);
      await websocketService.sendReaction(messageId, reaction);
      if (onAddReaction) {
        onAddReaction(reaction);
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    } finally {
      setIsAdding(false);
      setShowReactionPicker(false);
    }
  };

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.reaction]) {
      acc[reaction.reaction] = 0;
    }
    acc[reaction.reaction]++;
    return acc;
  }, {} as Record<string, number>);

  const totalReactions = reactions.length;

  if (totalReactions === 0 && !showReactionPicker) {
    return (
      <button
        onClick={() => setShowReactionPicker(true)}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Add reaction"
      >
        👍 Add reaction
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Reaction picker */}
      {showReactionPicker && (
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {commonReactions.map((reaction) => (
            <button
              key={reaction}
              onClick={() => handleAddReaction(reaction)}
              className="text-lg hover:bg-gray-100 rounded-full p-1 transition-colors"
              aria-label={`React with ${reaction}`}
              disabled={isAdding}
            >
              {reaction}
            </button>
          ))}
          <button
            onClick={() => setShowReactionPicker(false)}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
            aria-label="Close reaction picker"
          >
            ×
          </button>
        </div>
      )}

      {/* Existing reactions */}
      {Object.entries(groupedReactions).map(([reaction, count]) => (
        <Tooltip key={reaction} content={`${count} reaction${count !== 1 ? 's' : ''}`}>
          <button
            onClick={() => handleAddReaction(reaction)}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 text-xs transition-colors"
            aria-label={`React with ${reaction}`}
          >
            <span>{reaction}</span>
            {count > 1 && <span className="text-xs">{count}</span>}
          </button>
        </Tooltip>
      ))}

      {/* Add reaction button */}
      {!showReactionPicker && (
        <button
          onClick={() => setShowReactionPicker(true)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Add reaction"
        >
          {totalReactions > 0 ? '+' : '👍'}
        </button>
      )}
    </div>
  );
};