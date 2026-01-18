
import React, { useState } from 'react';
import { CameraFeed } from '../types';
import { X, Maximize, Activity, Video, Wifi, WifiOff, Edit3, Check, Plus } from 'lucide-react';

interface MultiCameraModalProps {
  cameras: CameraFeed[];
  onClose: () => void;
  onSelectCamera: (id: string) => void;
  onRenameCamera: (id: string, newName: string) => void;
}

const MultiCameraModal: React.FC<MultiCameraModalProps> = ({ cameras, onClose, onSelectCamera, onRenameCamera }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startEditing = (e: React.MouseEvent, cam: CameraFeed) => {
    e.stopPropagation();
    setEditingId(cam.id);
    setEditName(cam.name);
  };

  const saveName = (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    if (editName.trim()) {
      onRenameCamera(id, editName);
    }
    setEditingId(null);
  };

  const handleAddCameraClick = () => {
    onClose();
    const sidebarInput = document.querySelector('input[placeholder="Paste YouTube/RTSP Link..."]') as HTMLInputElement;
    if (sidebarInput) {
        sidebarInput.focus();
        sidebarInput.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-6 animate-in fade-in duration-300">
      <div className="w-full h-full max-w-7xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-4 uppercase italic">
                    <Activity className="text-blue-500" size={32} /> 
                    Live Camera Network
                </h2>
                <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mt-1">Real-time surveillance grid • {cameras.length} Active Feeds</p>
            </div>
            <button 
                onClick={onClose}
                className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all border border-slate-700 shadow-xl active:scale-95">
                <X size={28} />
            </button>
        </div>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-4 scrollbar-hide pb-10">
            {cameras.map((cam) => (
                <div 
                    key={cam.id} 
                    className="relative bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 group shadow-2xl hover:border-blue-500/50 transition-all cursor-pointer"
                    onClick={() => {
                        onSelectCamera(cam.id);
                        onClose();
                    }}
                >
                    {/* Video Feed Simulation */}
                    <div className="aspect-video w-full relative">
                        {cam.streamType === 'YOUTUBE' && cam.streamUrl ? (
                            <iframe 
                                src={`${cam.streamUrl}&background=1`} 
                                className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" 
                                title={cam.name}
                                referrerPolicy="strict-origin-when-cross-origin"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            ></iframe>
                        ) : cam.streamType === 'DIRECT' && cam.streamUrl ? (
                            <video 
                                src={cam.streamUrl} 
                                autoPlay muted loop playsInline
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                        ) : (
                            <img 
                                src={`https://picsum.photos/seed/construction_${cam.id}/800/450?grayscale`} 
                                alt={cam.name}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            />
                        )}
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                         <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border backdrop-blur-md flex items-center gap-2 ${
                             cam.status === 'RECORDING' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 
                             cam.status === 'IDLE' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' :
                             'bg-slate-500/10 border-slate-500/50 text-slate-400'
                         }`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${cam.status === 'RECORDING' ? 'bg-red-500 animate-pulse' : 'bg-current'}`}></div>
                             {cam.status}
                         </div>
                    </div>

                    <div className="absolute top-4 right-4">
                         <button className="p-2.5 bg-black/60 text-white rounded-xl hover:bg-blue-600 transition-all backdrop-blur-md border border-white/10">
                             <Maximize size={16} />
                         </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex justify-between items-end">
                            <div className="flex-1 pr-4">
                                {editingId === cam.id ? (
                                    <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-blue-500/50" onClick={e => e.stopPropagation()}>
                                        <input 
                                            autoFocus
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && saveName(e as any, cam.id)}
                                            className="bg-transparent text-white font-bold text-sm px-3 py-1 outline-none w-full"
                                        />
                                        <button onClick={e => saveName(e, cam.id)} className="bg-blue-600 p-1.5 rounded-lg text-white">
                                            <Check size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="group/name flex items-center gap-2">
                                        <h3 className="text-white font-black text-base flex items-center gap-2 uppercase italic truncate">
                                            {cam.type === 'DRONE' ? '🚁' : <Video size={16} className="text-blue-400"/>} 
                                            {cam.name}
                                        </h3>
                                        <button 
                                            onClick={e => startEditing(e, cam)}
                                            className="opacity-0 group-hover/name:opacity-100 p-1.5 hover:bg-white/10 rounded-lg text-slate-400 transition-all"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                    </div>
                                )}
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{cam.location}</p>
                            </div>
                            <div className="shrink-0">
                                {cam.status === 'OFFLINE' ? (
                                    <WifiOff size={20} className="text-slate-700" />
                                ) : (
                                    <Wifi size={20} className="text-green-500" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Add Camera Placeholder */}
            <div 
                onClick={handleAddCameraClick}
                className="bg-slate-900/40 rounded-[2rem] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 hover:border-blue-500/30 hover:text-blue-500 transition-all cursor-pointer min-h-[220px] group"
            >
                <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus size={32} />
                </div>
                <span className="font-black text-sm tracking-widest uppercase">Add New Feed</span>
                <span className="text-[10px] opacity-40 mt-1 font-bold">Configure RTSP/HTTP Stream</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MultiCameraModal;