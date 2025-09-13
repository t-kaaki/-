import React, { useState } from 'react';
import type { Player, LineupPlayer } from '../types';
import { POSITION_NAMES } from '../constants';

type PlayerTableProps = {
  title: string;
  players: (Player | LineupPlayer | null)[];
  onPositionChange?: (playerId: string, newPosition: string | number) => void;
  onPlayerDrop: (
    draggedPlayerId: string,
    source: 'roster' | 'bench' | 'starting',
    target: 'bench' | 'starting',
    targetIndex: number
  ) => void;
  droppableId: 'starting' | 'bench';
  conflictingPositions?: Set<string | number>;
};

const PlayerTable: React.FC<PlayerTableProps> = ({ title, players, onPositionChange, onPlayerDrop, droppableId, conflictingPositions }) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, player: Player | LineupPlayer) => {
    e.dataTransfer.setData("playerId", player._id);
    e.dataTransfer.setData("source", droppableId);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const playerId = e.dataTransfer.getData("playerId");
    const source = e.dataTransfer.getData("source") as 'roster' | 'bench' | 'starting';

    if (playerId) {
      onPlayerDrop(playerId, source, droppableId, dropIndex);
    }
  };

  // Fixed 10-slot format for Starting Lineup
  if (droppableId === 'starting') {
    const lineupSlots = Array.from({ length: 10 });
    const startingPlayers = players as (LineupPlayer | null)[];

    return (
      <div className="bg-slate-50 rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">{title}</h3>
        <div className="space-y-1">
          {lineupSlots.map((_, index) => {
            const player = startingPlayers[index];
            const isDragOver = dragOverIndex === index;
            const battingOrderDisplay = index < 9 ? `${index + 1}.` : 'FP';

            if (player) {
              const lineupPlayer = player as LineupPlayer;
              const isConflicting = conflictingPositions?.has(lineupPlayer.position) && lineupPlayer.position !== '';
              return (
                <div
                  key={lineupPlayer._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lineupPlayer)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-grab active:cursor-grabbing transition-all
                    ${isDragOver ? 'bg-blue-200 ring-2 ring-blue-400' : (index % 2 === 0 ? 'bg-white' : 'bg-slate-100')}
                  `}
                >
                  <span className="font-mono w-8 text-right text-slate-500">{battingOrderDisplay}</span>
                  {onPositionChange && (
                     <select 
                      value={lineupPlayer.position.toString()} 
                      onChange={(e) => onPositionChange(lineupPlayer._id, e.target.value)}
                      className={`p-1 border rounded bg-slate-50 w-20 text-center transition-colors text-sm ${isConflicting ? 'bg-red-200 border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">--</option>
                      {Object.entries(POSITION_NAMES).map(([key, name]) => (
                          <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                  )}
                  <span className="flex-grow font-medium text-slate-800">{lineupPlayer.name}</span>
                  <span className="text-slate-500 text-sm font-mono">(No.{lineupPlayer.uniformNumber})</span>
                </div>
              );
            } else {
              return (
                <div
                  key={`empty-${index}`}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`flex items-center gap-2 p-2 h-[46px] rounded-md transition-colors ${isDragOver ? 'bg-blue-200' : 'bg-slate-100/50'}`}
                >
                  <span className="font-mono w-8 text-right text-slate-400">{battingOrderDisplay}</span>
                  <span className="text-slate-400 italic text-sm">Drag player here</span>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  }

  // Table format for Bench
  const benchPlayers = players as Player[];
  const renderCell = (player: Player, column: string) => {
    switch(column) {
      case '名前':
        return player.name;
      case 'ユニNo':
        return player.uniformNumber;
      default:
        return '';
    }
  };
  const columns = ['名前', 'ユニNo'];
  const columnStyles = 'grid-template-columns: 1.5fr 0.7fr';

  return (
    <div className="bg-slate-50 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-player-table-bench bg-slate-200 rounded-t-md font-bold text-sm text-slate-600">
             {columns.map(col => (
               <div key={col} className={`p-2 ${col === '名前' ? 'text-left' : 'text-center'}`}>{col}</div>
             ))}
          </div>
          <div
            onDragOver={(e) => handleDragOver(e, benchPlayers.length)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, benchPlayers.length)}
            className={`transition-colors rounded-b-md min-h-[3rem] ${dragOverIndex === benchPlayers.length ? 'bg-blue-100' : ''}`}
          >
            {benchPlayers.map((player, index) => (
              <div 
                key={player._id}
                draggable
                onDragStart={(e) => handleDragStart(e, player)}
                onDragOver={(e) => {
                    e.stopPropagation();
                    handleDragOver(e, index)
                }}
                onDragLeave={(e) => {
                    e.stopPropagation();
                    handleDragLeave();
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  handleDrop(e, index);
                }}
                className={`grid grid-cols-player-table-bench border-b border-slate-200 last:border-b-0 text-sm cursor-grab active:cursor-grabbing transition-colors 
                  ${dragOverIndex === index ? 'bg-blue-200' : (index % 2 === 0 ? 'bg-white' : 'bg-slate-50')}
                `}
              >
                {columns.map(col => (
                  <div key={col} className={`p-2 flex items-center ${col === '名前' ? 'text-left' : 'justify-center'} whitespace-nowrap`}>
                    {renderCell(player, col)}
                  </div>
                ))}
              </div>
            ))}
             {benchPlayers.length === 0 && (
                <div className="text-center p-4 text-slate-500 italic">
                  Drag players here
                </div>
              )}
          </div>
        </div>
      </div>
      <style>{`
        .grid-cols-player-table-bench {
          ${columnStyles}
        }
      `}</style>
    </div>
  );
};

export default PlayerTable;