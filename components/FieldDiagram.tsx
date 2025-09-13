import React from 'react';
import type { LineupPlayer } from '../types';
import { POSITION_COORDINATES } from '../constants';

interface FieldDiagramProps {
  players: LineupPlayer[];
  onPositionDrop: (playerId: string, newPosition: string | number) => void;
}

const FieldDiagram: React.FC<FieldDiagramProps> = ({ players, onPositionDrop }) => {
  const handleDragStart = (e: React.DragEvent, player: LineupPlayer) => {
    e.dataTransfer.setData("playerId", player._id);
    e.dataTransfer.setData("source", "field"); // Identify the drag source
  };

  const getSVGCoordinates = (e: React.DragEvent, svg: SVGSVGElement) => {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: svgP.x, y: svgP.y };
  };

  const findClosestPosition = (x: number, y: number): string => {
    let closestPos = '';
    let minDistance = Infinity;

    for (const [pos, coords] of Object.entries(POSITION_COORDINATES)) {
      const distance = Math.sqrt(Math.pow(coords.x - x, 2) + Math.pow(coords.y - y, 2));
      if (distance < minDistance) {
        minDistance = distance;
        closestPos = pos;
      }
    }
    return closestPos;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const source = e.dataTransfer.getData("source");
    if (source !== "field") return; // Only handle drops originating from the field

    const playerId = e.dataTransfer.getData("playerId");
    if (!playerId) return;
    
    const svg = e.currentTarget as SVGSVGElement;
    const { x, y } = getSVGCoordinates(e, svg);
    
    const newPosition = findClosestPosition(x, y);

    if (newPosition) {
        // Prevent assigning a fielding position to the DP and vice-versa
        const player = players.find(p => p._id === playerId);
        if (player && player.position === 'DP' && newPosition !== 'DP') return;
        if (player && player.position !== 'DP' && newPosition === 'DP') return;

        onPositionDrop(playerId, newPosition);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Background Grass */}
        <rect width="100" height="100" fill="#4ade80" />
        
        {/* Infield Dirt Path */}
        <path d="M 50 95 L 0 45 A 60 60 0 0 1 100 45 Z" fill="#c28f5b" />
        
        {/* Pitcher's Mound */}
        <circle cx="50" cy="62" r="8" fill="#a16207" />
        
        {/* Foul Lines */}
        <line x1="50" y1="95" x2="100" y2="45" stroke="white" strokeWidth="0.5" />
        <line x1="50" y1="95" x2="0" y2="45" stroke="white" strokeWidth="0.5" />

        {/* Bases */}
        <g transform="translate(50, 95)">
          <path d="M 0 0 L -2.5 -2.5 V -5 H 2.5 V -2.5 Z" fill="white" /> {/* Home Plate */}
        </g>
        <rect x="71" y="66" width="5" height="5" fill="white" transform="rotate(45 73.5 68.5)" />   {/* 1st Base */}
        <rect x="47.5" y="42.5" width="5" height="5" fill="white" transform="rotate(45 50 45)" />   {/* 2nd Base */}
        <rect x="24" y="66" width="5" height="5" fill="white" transform="rotate(45 26.5 68.5)" />   {/* 3rd Base */}
        
        {/* Pitcher's Plate */}
        <rect x="46" y="61.5" width="8" height="1" fill="white" rx="0.5" />

        {/* Players */}
        {players.map((player) => {
          const positionKey = player.position.toString();
          const coords = POSITION_COORDINATES[positionKey];
          if (coords) {
            const isDP = positionKey === 'DP';
            const playerLabel = isDP ? `DP: ${player.name}` : player.name;
            const style = {
                backgroundColor: isDP ? '#dbeafe' : '#ffffff',
                color: isDP ? '#1e40af' : '#1f2937',
                border: `1px solid ${isDP ? '#93c5fd' : '#cbd5e1'}`,
                whiteSpace: 'nowrap',
                fontSize: '5px',
                lineHeight: '1',
            };
            
            const labelWidth = 24;
            const labelHeight = 7;

            const divProps: React.HTMLAttributes<HTMLDivElement> & { xmlns: string } = {
                xmlns: "http://www.w3.org/1999/xhtml",
                className: "flex justify-center items-center h-full cursor-grab active:cursor-grabbing",
                draggable: true,
                onDragStart: (e) => handleDragStart(e, player),
            };

            return (
              <g
                key={player._id}
                transform={`translate(${coords.x}, ${coords.y})`}
              >
                <foreignObject x={-labelWidth / 2} y={-labelHeight / 2} width={labelWidth} height={labelHeight} style={{ overflow: 'visible' }}>
                  <div {...divProps}>
                    <span className="font-semibold px-0.5 rounded-sm shadow-xs" style={style}>
                      {playerLabel}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};

export default FieldDiagram;