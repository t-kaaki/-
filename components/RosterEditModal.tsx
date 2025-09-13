import React, { useState, useEffect } from 'react';
import type { RosterPlayer } from '../types';

interface RosterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: RosterPlayer[];
  onSave: (updatedRoster: RosterPlayer[]) => void;
}

const RosterEditModal: React.FC<RosterEditModalProps> = ({ isOpen, onClose, roster, onSave }) => {
  const [editableRoster, setEditableRoster] = useState<RosterPlayer[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEditableRoster(JSON.parse(JSON.stringify(roster)));
    }
  }, [roster, isOpen]);

  if (!isOpen) {
    return null;
  }
  
  const handleInputChange = (index: number, field: 'name' | 'uniformNumber', value: string) => {
    const updatedRoster = [...editableRoster];
    const player = { ...updatedRoster[index] };

    if (field === 'uniformNumber') {
      player[field] = parseInt(value, 10) || 0;
    } else {
      player[field] = value;
    }
    
    updatedRoster[index] = player;
    setEditableRoster(updatedRoster);
  };

  const handleAddPlayer = () => {
    const newPlayer: RosterPlayer = { 
      _id: crypto.randomUUID(), 
      name: '', 
      uniformNumber: 0, 
      isPlaying: false 
    };
    setEditableRoster(prev => [...prev, newPlayer]);
  };

  const handleRemovePlayer = (idToRemove: string) => {
    setEditableRoster(prev => prev.filter((p) => p._id !== idToRemove));
  };
  
  const handleSave = () => {
    const cleanedRoster = editableRoster.filter(p => p.name.trim() !== '' && p.uniformNumber > 0);
    onSave(cleanedRoster);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Edit Team Roster</h2>
        
        <div className="flex-grow overflow-y-auto pr-2">
          <div className="space-y-3">
            {editableRoster.map((player, index) => (
              <div key={player._id} className="flex items-center gap-2">
                <input
                  type="number"
                  value={player.uniformNumber === 0 ? '' : player.uniformNumber}
                  onChange={(e) => handleInputChange(index, 'uniformNumber', e.target.value)}
                  className="w-24 p-2 border rounded-md"
                  placeholder="No."
                />
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  className="flex-grow p-2 border rounded-md"
                  placeholder="Name"
                />
                <button 
                  onClick={() => handleRemovePlayer(player._id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                  aria-label="Remove Player"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <button 
            onClick={handleAddPlayer} 
            className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
          >
            Add New Player
          </button>
        </div>
        
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RosterEditModal;