
import React from 'react';
import type { RosterPlayer } from '../types';

interface RosterStatusListProps {
  players: RosterPlayer[];
  onEdit: () => void;
}

const RosterStatusList: React.FC<RosterStatusListProps> = ({ players, onEdit }) => {

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, player: RosterPlayer) => {
        if (!player.isPlaying) {
            e.dataTransfer.setData("playerId", player._id);
            e.dataTransfer.setData("source", "roster");
        } else {
            e.preventDefault(); // Prevent dragging players already in lineup
        }
    };

  return (
    <div className="bg-slate-50 rounded-lg shadow-md p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-slate-800">Team Roster</h3>
        <button 
          onClick={onEdit}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="grid grid-cols-roster-status-custom gap-2 font-bold text-sm text-slate-600 bg-slate-200 p-2 rounded-t-md">
        <div className="text-center">ユニNo</div>
        <div>名前</div>
        <div className="text-center">Playing</div>
      </div>
      <div className="flex-grow max-h-[calc(100vh-28rem)] overflow-y-auto border-b border-slate-200">
        {players.map((player, index) => (
          <div
            key={player._id}
            draggable={!player.isPlaying}
            onDragStart={(e) => handleDragStart(e, player)}
            className={`grid grid-cols-roster-status-custom gap-2 p-2 text-sm border-b border-slate-200 last:border-b-0 
              ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              ${player.isPlaying ? 'opacity-50 text-gray-400' : 'cursor-grab active:cursor-grabbing'}`}
          >
            <div className="text-center font-mono">{player.uniformNumber}</div>
            <div className="whitespace-nowrap">{player.name}</div>
            <div className="flex justify-center items-center">
              {player.isPlaying ? (
                <span className="text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              ) : (
                <span className="text-gray-300">-</span>
              )}
            </div>
          </div>
        ))}
      </div>
        <style>{`.grid-cols-roster-status-custom { grid-template-columns: 0.5fr 1.5fr 0.5fr; }`}</style>
    </div>
  );
};

export default RosterStatusList;