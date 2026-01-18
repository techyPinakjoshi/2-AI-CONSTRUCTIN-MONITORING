
import React, { useState } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, Download, Printer, 
  Share2, Filter, Settings, ChevronRight, Calculator,
  Zap, ShieldCheck, Box, Clock, IndianRupee, FileText,
  Layers, HardHat, Building2, Map, LayoutGrid, Calendar,
  ArrowRight, CheckCircle2, ChevronDown, Crown, X
} from 'lucide-react';

interface BoqItem {
  id: string;
  code: string;
  description: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  category: 'Civil' | 'Mechanical' | 'Electrical' | 'Finishing';
}

const MOCK_SOR_DATA: BoqItem[] = [
  { id: '1', code: '2.1.1', category: 'Civil', description: 'Surface dressing of the ground in all kinds of soil (IS 1200-I)', qty: 1250, unit: 'sqm', rate: 45.50, amount: 56875 },
  { id: '2', code: '4.1.2', category: 'Civil', description: 'PCC 1:2:4 (1 cement : 2 coarse sand : 4 graded stone aggregate 20mm nominal size)', qty: 85, unit: 'cum', rate: 6450.00, amount: 548250 },
  { id: '3', code: '5.2.2', category: 'Civil', description: 'Reinforcement for RCC work including straightening, cutting, bending, binding and placing in position (TMT FE-500D)', qty: 12.5, unit: 'mt', rate: 72000.00, amount: 900000 },
  { id: '4', code: '13.1.1', category: 'Finishing', description: '12mm cement plaster of mix 1:6 (1 cement : 6 fine sand)', qty: 450, unit: 'sqm', rate: 215.00, amount: 96750 },
  { id: '5', code: 'E-401', category: 'Electrical', description: 'Supplying and drawing of 2x1.5 sq. mm FRLS PVC insulated copper conductor single core cable', qty: 240, unit: 'mtr', rate: 110.00, amount: 26400 },
];

const MOCK_TIMELINE = [
  { stage: 'Mobilization', duration: '5 Days', status: 'Upcoming', progress: 0, start: 'Mar 15' },
  { stage: 'Earthwork & Excavation', duration: '12 Days', status: 'Pending', progress: 0, start: 'Mar 20' },
  { stage: 'Substructure PCC', duration: '8 Days', status: 'Pending', progress: 0, start: 'Apr 02' },
  { stage: 'RCC Foundation', duration: '20 Days', status: 'Pending', progress: 0, start: 'Apr 10' },
];

interface BoqDashboardProps {
  onClose: () => void;
  onUpgrade?: () => void;
}

const BoqDashboard: React.FC<BoqDashboardProps> = ({ onClose, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sor' | 'timeline' | 'analytics'>('overview');
  const totalAmount = MOCK_SOR_DATA.reduce((acc, curr) => acc + curr.amount, 0);
  const gstAmount = totalAmount * 0.18;
  const grandTotal = totalAmount + gstAmount;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-sans animate-in fade-in duration-500">
      {/* 2026 Spec Header */}
      <header className="h-20 bg-slate-900/50 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-gradient-to-tr from-orange-500 to-red-600 rounded-2xl shadow-xl shadow-orange-500/20">
            <LayoutGrid className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase italic">PM <span className="text-orange-400">Suite</span> 2026</h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Project Management v2.0 • PWD SOR 25-26</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Budget Estimate</span>
            <span className="text-xl font-mono font-bold text-green-400">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
          {onUpgrade && (
            <button 
              onClick={onUpgrade}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl shadow-blue-600/20 transition-all border border-blue-400/20"
            >
              <Crown size={14} className="text-yellow-400" /> Unlock AI Monitoring
            </button>
          )}
          <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all border border-slate-700">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Control Rail */}
        <aside className="w-72 bg-slate-900/20 border-r border-white/5 flex flex-col p-6 space-y-8 overflow-y-auto">
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-3">Core Views</h3>
            <nav className="space-y-1">
              <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 size={18}/>} label="Financial Overview" color="orange" />
              <NavButton active={activeTab === 'sor'} onClick={() => setActiveTab('sor')} icon={<FileText size={18}/>} label="PWD SOR Table" color="orange" />
              <NavButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} icon={<Calendar size={18}/>} label="Planned Timeline" color="purple" />
              <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<TrendingUp size={18}/>} label="Cost Analytics" color="orange" />
            </nav>
          </div>

          <div className="pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Export Tools</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-400 transition-all border border-white/5">
                Download PDF <Download size={14} />
              </button>
              <button className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-400 transition-all border border-white/5">
                Export MS Project <Share2 size={14} />
              </button>
            </div>
          </div>
          
          <div className="mt-auto p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
            <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-tighter">
              2D Plan Analysis: v2.4.1
              Calculated quantities compliant with IS 1200 Standards.
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 grid-bg">
          <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label="Base Amount" value={`₹${totalAmount.toLocaleString('en-IN')}`} icon={<IndianRupee className="text-orange-400"/>} trend="+4.2%" />
                  <StatCard label="GST (18%)" value={`₹${gstAmount.toLocaleString('en-IN')}`} icon={<ShieldCheck className="text-blue-400"/>} trend="Fixed" />
                  <StatCard label="Extraction Accuracy" value="97.8%" icon={<CheckCircle2 className="text-green-400"/>} trend="High" />
                  <StatCard label="Planned Days" value="142" valueColor="text-purple-400" icon={<Clock className="text-purple-400"/>} trend="Estimated" />
                </div>

                <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row gap-8 items-center">
                   <div className="w-full md:w-1/3 text-center md:text-left space-y-4">
                      <div className="inline-flex p-3 bg-orange-500/10 rounded-2xl text-orange-400">
                        <Calculator size={24} />
                      </div>
                      <h2 className="text-2xl font-black text-white leading-tight">Project Summary</h2>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        Extracted from uploaded architectural and structural blueprints. Cross-verified with PWD Schedule of Rates 2025-26 database.
                      </p>
                   </div>
                   <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                      <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 hover:border-orange-500/20 transition-all group">
                         <div className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Total Steel Rebar</div>
                         <div className="text-2xl font-black text-white group-hover:text-orange-400 transition-colors">12.5 MT</div>
                         <div className="text-[10px] text-slate-600 mt-2 italic">Standard FE-500D Grade</div>
                      </div>
                      <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 hover:border-purple-500/20 transition-all group">
                         <div className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Concrete Quantity</div>
                         <div className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">850 m³</div>
                         <div className="text-[10px] text-slate-600 mt-2 italic">M25 Grade Estimations</div>
                      </div>
                   </div>
                </div>
              </>
            )}

            {activeTab === 'sor' && (
              <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-800/20">
                  <h2 className="text-xl font-black text-white flex items-center gap-3 italic">
                    <Calculator size={22} className="text-orange-400" />
                    PWD SOR <span className="text-slate-500">2025-26 Breakdown</span>
                  </h2>
                  <div className="flex gap-2">
                    <button className="bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-white/5">
                      <Filter size={14} /> Filter
                    </button>
                    <button className="bg-orange-600 hover:bg-orange-500 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-white transition-all shadow-xl shadow-orange-600/20">
                      <Download size={14} /> Export CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800/40 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                        <th className="px-8 py-5">Item Code</th>
                        <th className="px-8 py-5">Description</th>
                        <th className="px-8 py-5 text-center">Unit</th>
                        <th className="px-8 py-5 text-right">Qty</th>
                        <th className="px-8 py-5 text-right">Rate (₹)</th>
                        <th className="px-8 py-5 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {MOCK_SOR_DATA.map((item) => (
                        <tr key={item.id} className="hover:bg-orange-500/5 transition-colors group">
                          <td className="px-8 py-5">
                            <span className="text-xs font-mono font-bold text-orange-400 bg-orange-400/5 px-3 py-1.5 rounded-lg border border-orange-400/20">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-tighter">{item.category}</div>
                            <div className="text-xs font-bold text-white leading-relaxed">{item.description}</div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-[10px] font-black text-slate-600 uppercase">{item.unit}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="text-sm font-mono font-black text-white">{item.qty}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="text-sm font-mono text-slate-400">{item.rate.toLocaleString('en-IN')}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="text-sm font-mono font-black text-white">{item.amount.toLocaleString('en-IN')}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Planned <span className="text-purple-400">Timeline</span></h2>
                    <p className="text-slate-400 text-sm mt-2">Critical Path Duration: <span className="text-white font-bold">142 Working Days</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {MOCK_TIMELINE.map((step, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden group hover:border-purple-500/30 transition-all">
                       <div className="absolute top-4 right-8 text-[10px] font-black text-slate-700 uppercase tracking-widest">{step.start}</div>
                       <div className="flex items-center gap-4 mb-6">
                         <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                            <Calendar size={24} />
                         </div>
                         <div>
                            <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors uppercase italic">{step.stage}</h3>
                            <span className="text-xs text-slate-500 font-bold">Duration: {step.duration}</span>
                         </div>
                       </div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 w-1 rounded-full group-hover:w-full transition-all duration-1000"></div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, color = "orange" }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
      active 
      ? `bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 shadow-xl shadow-${color}-500/5` 
      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
    }`}
  >
    {React.cloneElement(icon, { size: 18 })} {label}
  </button>
);

const StatCard = ({ label, value, icon, trend, valueColor = "text-white" }: any) => (
  <div className="bg-slate-900/60 border border-white/5 p-8 rounded-[2rem] backdrop-blur-md hover:border-white/20 transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 text-slate-400 group-hover:bg-orange-500/10 group-hover:text-orange-400 transition-all">
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full bg-slate-800 border border-white/5 ${trend.startsWith('+') ? 'text-green-400' : 'text-slate-500'}`}>
        {trend}
      </span>
    </div>
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</div>
    <div className={`text-2xl font-black ${valueColor} tracking-tight`}>{value}</div>
  </div>
);

export default BoqDashboard;
