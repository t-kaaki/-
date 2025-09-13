import React, { useMemo } from 'react';
import type { Lineup, Player, LineupPlayer } from '../types';
import PlayerTable from './PlayerTable';
import FieldDiagram from './FieldDiagram';

interface LineupCardProps {
  lineup: Lineup;
  onPositionChange: (playerId: string, newPosition: string | number) => void;
  onPlayerDrop: (
    draggedPlayerId: string,
    source: 'roster' | 'bench' | 'starting' | 'field',
    target: 'bench' | 'starting',
    targetIndex: number
  ) => void;
  onPositionDrop: (playerId: string, newPosition: string | number) => void;
}

const LineupCard: React.FC<LineupCardProps> = ({ lineup, onPositionChange, onPlayerDrop, onPositionDrop }) => {
  const conflictingPositions = useMemo(() => {
    const positionCounts = new Map<string | number, number>();
    lineup.starting.forEach(player => {
      if (player && player.position && player.position !== 'DP' && player.position !== 'FP' && player.position !== '') {
        const count = positionCounts.get(player.position) || 0;
        positionCounts.set(player.position, count + 1);
      }
    });

    const conflicts = new Set<string | number>();
    for (const [position, count] of positionCounts.entries()) {
      if (count > 1) {
        conflicts.add(position);
      }
    }
    return conflicts;
  }, [lineup.starting]);

  const fieldPlayers = lineup.starting.filter((p): p is LineupPlayer => p !== null);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Field */}
        <div className="lg:col-span-1 flex flex-col">
          <h2 className="text-2xl font-bold text-center text-slate-700 mb-6">
            {lineup.title}
          </h2>
          <div className="flex-grow flex items-center justify-center">
            <FieldDiagram players={fieldPlayers} onPositionDrop={onPositionDrop} />
          </div>
        </div>
        
        {/* Column 2: Lineup */}
        <div className="lg:col-span-1">
          <PlayerTable
            title="Starting Lineup"
            players={lineup.starting}
            onPositionChange={onPositionChange}
            onPlayerDrop={onPlayerDrop}
            droppableId="starting"
            conflictingPositions={conflictingPositions}
          />
        </div>

        {/* Column 3: Bench */}
        <div className="lg:col-span-1">
          <PlayerTable
            title="Bench"
            players={lineup.bench}
            onPlayerDrop={onPlayerDrop}
            droppableId="bench"
          />
        </div>
      </div>
    </div>
  );
};

export default LineupCard;