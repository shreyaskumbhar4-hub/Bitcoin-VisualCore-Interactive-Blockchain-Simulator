/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { P2PNode, NetworkPacket } from '../core/types';
import { Network, Radio, Send, Cpu, Server, Smartphone, ShoppingCart, ShieldCheck } from 'lucide-react';

interface P2PNetworkSimulatorProps {
  nodes: P2PNode[];
  packets: NetworkPacket[];
  chainHeight: number;
  mempoolCount: number;
  onSimulateGossip: (type: 'tx' | 'block') => void;
}

export const P2PNetworkSimulator: React.FC<P2PNetworkSimulatorProps> = ({
  nodes,
  packets,
  chainHeight,
  mempoolCount,
  onSimulateGossip,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || 'node-alice');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Peer topology edges (connecting node centers)
  const edges = [
    { from: 'node-alice', to: 'node-charlie' },
    { from: 'node-charlie', to: 'node-bob' },
    { from: 'node-bob', to: 'node-dave' },
    { from: 'node-alice', to: 'node-bob' },
    { from: 'node-charlie', to: 'node-dave' },
    { from: 'node-alice', to: 'node-dave' },
  ];

  const getNodeRoleBadge = (type: P2PNode['type']) => {
    switch (type) {
      case 'miner':
        return { label: 'ASIC Miner', color: '#f59e0b', bg: '#451a03' };
      case 'full':
        return { label: 'Full Node', color: '#38bdf8', bg: '#082f49' };
      case 'merchant':
        return { label: 'Merchant', color: '#34d399', bg: '#064e3b' };
      case 'light':
        return { label: 'SPV Client', color: '#c084fc', bg: '#3b0764' };
    }
  };

  const getNodeIcon = (type: P2PNode['type']) => {
    switch (type) {
      case 'miner':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      case 'full':
        return <Server className="w-4 h-4 text-sky-400" />;
      case 'merchant':
        return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'light':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              P2P Gossip Network Simulator
            </h2>
            <p className="text-xs text-slate-400">
              Decentralized peer-to-peer message flooding & consensus verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSimulateGossip('tx')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>Gossip Transaction</span>
          </button>
          <button
            onClick={() => onSimulateGossip('block')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Block</span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Touch Friendly Node Selector Strip */}
      <div className="lg:hidden mb-3">
        <span className="text-[10px] text-slate-400 font-mono block mb-1">
          Select Peer Node to Inspect:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {nodes.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNodeId(n.id)}
              className={`p-2 rounded text-xs font-medium text-left truncate transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedNodeId === n.id
                  ? 'bg-amber-500/20 border border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {getNodeIcon(n.type)}
              <span className="truncate">{n.name.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Responsive 2D Vector SVG Network Topology Canvas */}
        <div className="lg:col-span-2 relative bg-slate-950 rounded-lg border border-slate-800 p-2 sm:p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-2 px-1">
            <span>Global Peer Mesh (TCP Port 8333)</span>
            <span className="text-slate-400">
              {nodes.length} Nodes Online · {edges.length} Active Connections
            </span>
          </div>

          {/* SVG Canvas - auto scales perfectly from 320px mobile to 1440px desktop */}
          <div className="w-full flex items-center justify-center">
            <svg
              viewBox="0 0 800 380"
              className="w-full h-auto max-h-[380px] select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Node selection glow filter */}
                <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.45" />
                </filter>
                <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#475569" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Background Network Topology Grid Lines */}
              <g opacity="0.15">
                {[80, 160, 240, 320].map((y) => (
                  <line key={`h-${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#64748b" strokeWidth="1" strokeDasharray="4 8" />
                ))}
                {[160, 320, 480, 640].map((x) => (
                  <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="380" stroke="#64748b" strokeWidth="1" strokeDasharray="4 8" />
                ))}
              </g>

              {/* P2P Connection Links (Edges) */}
              {edges.map((edge, idx) => {
                const nodeA = nodes.find((n) => n.id === edge.from);
                const nodeB = nodes.find((n) => n.id === edge.to);
                if (!nodeA || !nodeB) return null;

                return (
                  <g key={`edge-${idx}`}>
                    <line
                      x1={nodeA.x}
                      y1={nodeA.y}
                      x2={nodeB.x}
                      y2={nodeB.y}
                      stroke="url(#linkGradient)"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                    />
                    {/* Small connection midpoint indicator */}
                    <circle
                      cx={(nodeA.x + nodeB.x) / 2}
                      cy={(nodeA.y + nodeB.y) / 2}
                      r="2"
                      fill="#64748b"
                    />
                  </g>
                );
              })}

              {/* Active Animated Gossip Packets */}
              {packets.map((pkt) => {
                const from = nodes.find((n) => n.id === pkt.fromNodeId);
                const to = nodes.find((n) => n.id === pkt.toNodeId);
                if (!from || !to) return null;

                const curX = from.x + (to.x - from.x) * pkt.progress;
                const curY = from.y + (to.y - from.y) * pkt.progress;
                const isBlock = pkt.type === 'block';

                return (
                  <g key={pkt.id} transform={`translate(${curX}, ${curY})`}>
                    <circle
                      r="9"
                      fill={isBlock ? '#f59e0b' : '#38bdf8'}
                      opacity="0.35"
                    />
                    <circle
                      r="5"
                      fill={isBlock ? '#f59e0b' : '#38bdf8'}
                    />
                  </g>
                );
              })}

              {/* Node Visual Cards (Vector SVG) */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const badge = getNodeRoleBadge(node.type);
                const cardWidth = 140;
                const cardHeight = 68;
                const x0 = node.x - cardWidth / 2;
                const y0 = node.y - cardHeight / 2;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer"
                    filter={isSelected ? 'url(#glow-amber)' : undefined}
                  >
                    {/* Card container */}
                    <rect
                      x={x0}
                      y={y0}
                      width={cardWidth}
                      height={cardHeight}
                      rx="8"
                      fill={isSelected ? '#0f172a' : '#090d16'}
                      stroke={isSelected ? '#f59e0b' : '#1e293b'}
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                    />

                    {/* Role header strip inside card */}
                    <rect
                      x={x0 + 1}
                      y={y0 + 1}
                      width={cardWidth - 2}
                      height="20"
                      rx="7"
                      fill={badge.bg}
                      opacity="0.85"
                    />
                    <text
                      x={node.x}
                      y={y0 + 14}
                      fill={badge.color}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                      textAnchor="middle"
                    >
                      {badge.label.toUpperCase()}
                    </text>

                    {/* Node Name */}
                    <text
                      x={node.x}
                      y={y0 + 36}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                      textAnchor="middle"
                    >
                      {node.name.split(' ')[0]} {node.name.split(' ')[1]}
                    </text>

                    {/* Telemetry (Height & Mempool) */}
                    <text
                      x={node.x}
                      y={y0 + 54}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="ui-monospace, monospace"
                      textAnchor="middle"
                    >
                      H: #{chainHeight} · Mem: {mempoolCount}
                    </text>

                    {/* Active pulse on miner or synced */}
                    <circle
                      cx={x0 + 12}
                      cy={y0 + 10}
                      r="3"
                      fill={node.type === 'miner' ? '#f59e0b' : '#10b981'}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span> Blue: Transactions
              <span className="w-2 h-2 rounded-full bg-amber-400 ml-2"></span> Gold: Blocks
            </span>
            <span>Tap any node card to inspect</span>
          </div>
        </div>

        {/* Selected Node Details & Rules Sidebar */}
        <div className="space-y-4 text-xs">
          {selectedNode && (
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {getNodeIcon(selectedNode.type)}
                  <span className="font-bold text-white text-sm">
                    {selectedNode.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-semibold uppercase">
                  {selectedNode.type}
                </span>
              </div>

              <div className="space-y-2 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Node Role:</span>
                  <span className="text-white capitalize">{selectedNode.type} Node</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-300">{selectedNode.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Synchronized Height:</span>
                  <span className="text-emerald-400 font-bold">#{chainHeight}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-500">Local Mempool:</span>
                  <span className="text-amber-400 font-bold">{mempoolCount} transactions</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Active Peers:</span>
                  <span className="text-slate-300">{selectedNode.peers.length} connections</span>
                </div>
              </div>
            </div>
          )}

          {/* Educational Consensus Callout */}
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>How Gossip Message Flooding Works:</span>
            </div>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              When a transaction or newly mined block is broadcast, it does not send through a centralized server. Instead, it floods to direct neighbors, who validate its digital signature and proof of work before relaying it to their own neighbors.
            </p>
            <p className="leading-relaxed text-slate-400 text-[11px]">
              If any peer transmits an invalid transaction or fake block, honest nodes drop the packet immediately, preventing malicious data from contaminating the distributed ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
