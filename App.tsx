
import React, { useState, useCallback } from 'react';
import LineupCard from './components/LineupCard';
import RosterEditModal from './components/RosterEditModal';
import { initialLineups, initialRoster } from './data/initialData';
import type { Lineup, RosterPlayer, LineupPlayer, Player } from './types';
import AddLineupModal from './components/AddLineupModal';
import ConfirmationModal from './components/ConfirmationModal';

const App: React.FC = () => {
  const [lineups, setLineups] = useState<{ [key: string]: Lineup }>(() => initialLineups);
  const [masterRoster, setMasterRoster] = useState<RosterPlayer[]>(() => initialRoster);
  const [selectedLineupKey, setSelectedLineupKey] = useState<string>(() => Object.keys(initialLineups)[0] || '');
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isAddLineupModalOpen, setIsAddLineupModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const selectedLineup = lineups[selectedLineupKey];

  const handleLineupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLineupKey(event.target.value);
  };

  const updateLineup = useCallback((key: string, updatedLineup: Lineup) => {
    setLineups(prev => ({ ...prev, [key]: updatedLineup }));
  }, []);
  
  const handlePositionChange = (playerId: string, newPosition: string | number) => {
    if (!selectedLineup) return;
    const updatedStarting = selectedLineup.starting.map(p =>
      p && p._id === playerId ? { ...p, position: newPosition } : p
    );
    updateLineup(selectedLineupKey, { ...selectedLineup, starting: updatedStarting });
  };

  const handleUpdateRoster = (updatedRoster: RosterPlayer[]) => {
    const newLinups = { ...lineups };
    const updatedRosterIds = new Set(updatedRoster.map(p => p._id));

    for (const key in newLinups) {
        const lineup = newLinups[key];

        // Update player info, or remove them if they are no longer in the roster
        const newStarting = lineup.starting
            .map(player => {
                if (!player) return null;
                if (!updatedRosterIds.has(player._id)) return null; // Player was deleted
                const updatedInfo = updatedRoster.find(p => p._id === player._id);
                return updatedInfo ? { ...player, name: updatedInfo.name, uniformNumber: updatedInfo.uniformNumber } : null;
            });

        const newBench = lineup.bench
            .filter(player => updatedRosterIds.has(player._id)) // Filter out deleted players
            .map(player => {
                const updatedInfo = updatedRoster.find(p => p._id === player._id);
                return updatedInfo ? { ...player, name: updatedInfo.name, uniformNumber: updatedInfo.uniformNumber } : player;
            });
        
        const playingIds = new Set([
            ...newStarting.filter(p => p).map(p => p!._id),
            ...newBench.map(p => p._id)
        ]);

        const newRosterStatus = updatedRoster.map(player => ({
            ...player,
            isPlaying: playingIds.has(player._id),
        }));
        
        newLinups[key] = {
            ...lineup,
            starting: newStarting,
            bench: newBench,
            rosterStatus: newRosterStatus,
        };
    }
    
    setLineups(newLinups);
    setMasterRoster(updatedRoster);
    setIsRosterModalOpen(false);
  };

  const handlePositionDrop = (playerId: string, newPosition: string | number) => {
    if (!selectedLineup) return;
    const updatedStarting = [...selectedLineup.starting];
    const draggedPlayerIndex = updatedStarting.findIndex(p => p?._id === playerId);

    if (draggedPlayerIndex === -1 || !updatedStarting[draggedPlayerIndex]) return;

    const draggedPlayer = updatedStarting[draggedPlayerIndex]!;
    const originalPosition = draggedPlayer.position;

    // eslint-disable-next-line eqeqeq
    if (originalPosition == newPosition) return;

    const targetPlayerIndex = updatedStarting.findIndex(
      // eslint-disable-next-line eqeqeq
      p => p?.position == newPosition
    );
    
    if (targetPlayerIndex !== -1 && updatedStarting[targetPlayerIndex]) {
      updatedStarting[targetPlayerIndex]!.position = originalPosition;
    }

    draggedPlayer.position = newPosition;
    
    updateLineup(selectedLineupKey, { ...selectedLineup, starting: updatedStarting });
  };

  const handlePlayerDrop = (
    draggedPlayerId: string,
    source: 'roster' | 'bench' | 'starting' | 'field',
    target: 'bench' | 'starting',
    targetIndex: number
  ) => {
    if (source === 'field' || !selectedLineup) return; 

    const newStarting = [...selectedLineup.starting];
    const newBench = [...selectedLineup.bench];
    let newRosterStatus = [...selectedLineup.rosterStatus];

    let draggedPlayer: Player | LineupPlayer | null = null;
    let sourceIndex: number | null = null;
    
    if (source === 'starting') {
        sourceIndex = newStarting.findIndex(p => p?._id === draggedPlayerId);
        if(sourceIndex !== -1) {
            draggedPlayer = newStarting[sourceIndex];
            newStarting[sourceIndex] = null;
        }
    } else if (source === 'bench') {
        draggedPlayer = newBench.find(p => p._id === draggedPlayerId) || null;
        if(draggedPlayer) {
          newBench.splice(newBench.findIndex(p => p._id === draggedPlayerId), 1);
        }
    } else {
        draggedPlayer = masterRoster.find(p => p._id === draggedPlayerId) || null;
    }
    
    if (!draggedPlayer) return;

    if (target === 'starting') {
        const playerAtTarget = newStarting[targetIndex];
        const newPlayerForLineup: LineupPlayer = {
          _id: draggedPlayer._id,
          name: draggedPlayer.name,
          uniformNumber: draggedPlayer.uniformNumber,
          battingOrder: targetIndex < 9 ? targetIndex + 1 : 0,
          position: (draggedPlayer as LineupPlayer).position || '',
          isFlex: targetIndex === 9,
        };
        
        newStarting[targetIndex] = newPlayerForLineup;

        if (playerAtTarget) {
            if (source === 'starting' && sourceIndex !== null) {
                newStarting[sourceIndex] = playerAtTarget;
            } else {
                newBench.push({ _id: playerAtTarget._id, name: playerAtTarget.name, uniformNumber: playerAtTarget.uniformNumber });
            }
        }
    } else {
        newBench.splice(targetIndex, 0, { _id: draggedPlayer._id, name: draggedPlayer.name, uniformNumber: draggedPlayer.uniformNumber });
    }

    const playingIds = new Set([...newStarting.filter(p => p).map(p => p!._id), ...newBench.map(p => p._id)]);
    newRosterStatus = masterRoster.map(p => ({
      ...p,
      isPlaying: playingIds.has(p._id)
    }));

    updateLineup(selectedLineupKey, {
      ...selectedLineup,
      starting: newStarting,
      bench: newBench,
      rosterStatus: newRosterStatus,
    });
  };

  const handleCreateLineup = (title: string) => {
    if (title && title.trim() !== "") {
      const newKey = `lineup_${crypto.randomUUID()}`;
      
      const newBench: Player[] = masterRoster.map(({ _id, name, uniformNumber }) => ({ _id, name, uniformNumber }));

      const newEmptyLineup: Lineup = {
        title: title.trim(),
        starting: Array(10).fill(null),
        bench: newBench,
        rosterStatus: masterRoster.map(p => ({ ...p, isPlaying: true })),
      };
      setLineups(prev => ({ ...prev, [newKey]: newEmptyLineup }));
      setSelectedLineupKey(newKey);
      setIsAddLineupModalOpen(false);
    }
  };

  const handleDeleteLineup = () => {
    if (Object.keys(lineups).length <= 1) {
      alert("You cannot delete the last lineup.");
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const lineupKeys = Object.keys(lineups);
    if (lineupKeys.length <= 1 || !selectedLineupKey) return;

    const newLinupes = { ...lineups };
    delete newLinupes[selectedLineupKey];

    const remainingKeys = Object.keys(newLinupes);
    const currentIndex = lineupKeys.indexOf(selectedLineupKey);
    const nextSelectedKey = remainingKeys.length > 0 ? remainingKeys[Math.max(0, currentIndex - 1)] : '';
    
    setLineups(newLinupes);
    setSelectedLineupKey(nextSelectedKey);
    setIsDeleteModalOpen(false);
  };


  if (!selectedLineup) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-slate-700 mb-4">No Lineups Available</h1>
              <p className="text-slate-500 mb-6">Create a new lineup to get started.</p>
              <button
                  onClick={() => setIsAddLineupModalOpen(true)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Lineup
              </button>
          </div>
        </div>
        <AddLineupModal
          isOpen={isAddLineupModalOpen}
          onClose={() => setIsAddLineupModalOpen(false)}
          onAdd={handleCreateLineup}
        />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-100 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 p-4 bg-white rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61v5.013l-4.16-2.285a1 1 0 00-1.21.22l-2 3a1 1 0 001.21 1.594l1.9-2.846 4.26 2.339a1 1 0 00.98 0l7-3.818a1 1 0 000-1.782l-7-3.818zM11 10.982l-1 1V5.83l1-1v6.152z" />
                </svg>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                  Softball Lineup Manager
                </h1>
                <button 
                  onClick={() => setIsRosterModalOpen(true)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                  </svg>
                  Edit Roster
                </button>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <select
                  value={selectedLineupKey}
                  onChange={handleLineupChange}
                  className="w-full sm:w-56 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={Object.keys(lineups).length === 0}
                >
                  {Object.keys(lineups).map((key) => (
                    <option key={key} value={key}>
                      {lineups[key].title}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => setIsAddLineupModalOpen(true)}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  aria-label="Add new lineup"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={handleDeleteLineup}
                  disabled={Object.keys(lineups).length <= 1}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  aria-label="Delete current lineup"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          <main>
            <LineupCard 
              lineup={selectedLineup}
              onPositionChange={handlePositionChange}
              onPlayerDrop={handlePlayerDrop}
              onPositionDrop={handlePositionDrop}
            />
          </main>
        </div>
      </div>
      <RosterEditModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        roster={masterRoster}
        onSave={handleUpdateRoster}
      />
      <AddLineupModal
        isOpen={isAddLineupModalOpen}
        onClose={() => setIsAddLineupModalOpen(false)}
        onAdd={handleCreateLineup}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Lineup"
        message={`Are you sure you want to delete the lineup "${selectedLineup?.title}"? This action cannot be undone.`}
      />
    </>
  );
};

export default App;
