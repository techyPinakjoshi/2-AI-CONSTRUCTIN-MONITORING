import React from 'react';
import { CameraFeed } from '../types';
import { X, Maximize, Activity, Video, Wifi, WifiOff } from 'lucide-react';

interface MultiCameraModalProps {
  cameras: CameraFeed[];
  onClose: () => void;
  onSelectCamera: (id: string) => void;
}

const MultiCameraModal: React.FC<MultiCameraModalProps> = ({ cameras, onClose, onSelectCamera }) => {
  const handleAddCameraClick = () => {
    // We want to trigger the same logic as the sidebar. 
    // Since we didn't pass the handler here yet, we can simply close the modal 
    // and rely on the user to use the sidebar, OR ideally, we should update App.tsx to pass onAddCamera here.
    // Given the constraints and to keep it simple without changing too many props:
    // We will simulate a click or show an alert, but the best UX is to tell the user to use Sidebar or close modal.
    // However, to satisfy the prompt "show once plus button is clicked... updated in grid", 
    // the previous Sidebar change already handles the "update in grid" part because 'cameras' is shared state.
    // This placeholder is just an extra UI element.
    onClose();
    // In a real app we'd pass onAddCamera here too.
    const sidebarInput = document.querySelector('input[placeholder="Paste YouTube/RTSP Link..."]') as HTMLInputElement;
    if (sidebarInput) {
        sidebarInput.focus();
        sidebarInput.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-6 animate-in fade-in duration-200">
      <div className="w-full h-full max-w-7xl flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Activity className="text-blue-500" /> Live Camera Network
                </h2>
                <p className="text-slate-400">Real-time surveillance grid • {cameras.length} Active Feeds</p>
            </div>
            <button 
                onClick={onClose}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors border border-slate-700">
                <X size={24} />
            </button>
        </div>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2">
            {cameras.map((cam) => (
                <div 
                    key={cam.id} 
                    className="relative bg-black rounded-xl overflow-hidden border border-slate-800 group shadow-2xl hover:border-blue-500/50 transition-colors cursor-pointer"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                         <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border backdrop-blur-md flex items-center gap-1.5 ${
                             cam.status === 'RECORDING' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 
                             cam.status === 'IDLE' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
                             'bg-slate-500/20 border-slate-500/50 text-slate-400'
                         }`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${cam.status === 'RECORDING' ? 'bg-red-500 animate-pulse' : 'bg-current'}`}></div>
                             {cam.status}
                         </div>
                    </div>

                    <div className="absolute top-3 right-3">
                         <button className="p-1.5 bg-black/50 text-white rounded hover:bg-blue-600 transition-colors backdrop-blur">
                             <Maximize size={14} />
                         </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                    {cam.type === 'DRONE' ? '🛸' : <Video size={14} className="text-blue-400"/>} 
                                    {cam.name}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">{cam.location}</p>
                            </div>
                            <div className="text-right">
                                {cam.status === 'OFFLINE' ? (
                                    <WifiOff size={16} className="text-slate-600" />
                                ) : (
                                    <Wifi size={16} className="text-green-500" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Add Camera Placeholder - Now Redirects to Sidebar Input */}
            <div 
                onClick={handleAddCameraClick}
                className="bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 hover:border-slate-600 hover:text-slate-400 transition-all cursor-pointer min-h-[200px]"
            >
                <Activity size={48} className="mb-4 opacity-50" />
                <span className="font-bold text-sm">CONNECT NEW FEED</span>
                <span className="text-xs opacity-50 mt-1">Configure via Sidebar</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MultiCameraModal;