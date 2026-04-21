import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Camera, Upload, Play, Settings, Layers, Box, Cpu } from 'lucide-react';

export const TwinCaptureScreen = ({ onBack, onComplete }: { onBack: () => void, onComplete: (modelId: string) => void }) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isCompiling) {
      if (progress < 100) {
        const timer = setTimeout(() => setProgress(p => p + 2), 50);
        return () => clearTimeout(timer);
      } else {
        setTimeout(() => onComplete('twin-model-xyz'), 500);
      }
    }
  }, [isCompiling, progress, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-background text-on-surface overflow-y-auto custom-scrollbar"
    >
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-surface-container-high transition-all active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Box size={16} />
             </div>
             <h1 className="font-headline tracking-widest text-lg font-bold uppercase uppercase">TwinCapture Engine</h1>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column - 3D Viewport / Camera Preview */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-4">
          <div className="relative aspect-video bg-surface-container-lowest rounded-3xl border border-white/10 overflow-hidden flex items-center justify-center group shadow-2xl">
             <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/scan/1280/720')] bg-cover bg-center opacity-50 grayscale mix-blend-screen" />
             <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/50" />
             
             {/* Scanning Reticle Animation */}
             <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-64 h-64 border border-primary/20 rounded-full"
             />
             <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-48 h-48 border border-white/10 rounded-full border-dashed"
             />

             <div className="relative z-10 flex flex-col items-center gap-4">
               <div className="p-6 bg-surface-container/80 backdrop-blur border border-white/10 rounded-full text-on-surface shadow-2xl cursor-pointer hover:bg-primary hover:text-on-primary transition-all active:scale-95">
                  <Camera size={32} />
               </div>
               <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Initialize Volumetric Scan</p>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
             <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex flex-col items-center cursor-pointer hover:border-primary/50 transition-all group">
                <Upload size={24} className="mb-3 text-outline group-hover:text-primary transition-colors" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Upload Video</span>
             </div>
             <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex flex-col items-center cursor-pointer hover:border-primary/50 transition-all group">
                <Layers size={24} className="mb-3 text-outline group-hover:text-primary transition-colors" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Multi-View IMGs</span>
             </div>
             <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex flex-col items-center cursor-pointer hover:border-primary/50 transition-all group">
                <Play size={24} className="mb-3 text-outline group-hover:text-primary transition-colors" />
                <span className="text-[10px] uppercase font-bold tracking-widest">Realtime Feed</span>
             </div>
          </div>
        </div>

        {/* Right Column - Controls & Processing */}
        <div className="col-span-1 md:col-span-4 space-y-6">
          <div className="p-6 bg-surface-container-lowest border border-white/5 rounded-3xl">
             <h3 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                <Settings size={18} className="text-primary"/> Reconstruction Params
             </h3>
             <div className="space-y-6">
               <div>
                  <label className="flex justify-between text-[10px] uppercase tracking-widest text-outline mb-2">
                     <span>Gaussian Splatting Quality</span>
                     <span className="text-primary">High</span>
                  </label>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                     <div className="h-full bg-primary w-[80%]" />
                  </div>
               </div>
               <div>
                  <label className="flex justify-between text-[10px] uppercase tracking-widest text-outline mb-2">
                     <span>Neural Radiance Field (NeRF)</span>
                     <span className="text-secondary">-</span>
                  </label>
                  <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                     <div className="h-full bg-secondary w-[40%]" />
                  </div>
               </div>
               <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-outline font-bold">Auto-Rigging</span>
                  <div className="w-10 h-5 bg-primary rounded-full relative">
                     <div className="absolute right-1 top-1 bg-background w-3 h-3 rounded-full" />
                  </div>
               </div>
             </div>
          </div>

          <div className="p-6 bg-surface-container-low border border-primary/20 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
             <Cpu size={24} className="text-primary mb-4 relative z-10" />
             <h3 className="font-headline font-bold text-xl mb-2 relative z-10">Start Generation</h3>
             <p className="text-xs text-outline font-light mb-6 relative z-10 leading-relaxed">
               Begins cloud processing pipeline. This will consume approximately <span className="text-primary font-bold">150 Compute Credits</span>.
             </p>
             {isCompiling ? (
               <div className="relative z-10 w-full h-12 bg-surface-container-highest rounded-full overflow-hidden flex items-center justify-center">
                 <div className="absolute left-0 top-0 h-full bg-primary transition-all duration-75" style={{ width: `${progress}%` }} />
                 <span className="relative z-10 font-bold text-xs uppercase tracking-widest text-on-surface">{progress}%</span>
               </div>
             ) : (
               <button 
                 onClick={() => setIsCompiling(true)}
                 className="w-full py-4 bg-on-surface text-background rounded-full font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10"
               >
                 COMPILE TWIN
               </button>
             )}
          </div>
        </div>

      </main>
    </motion.div>
  );
};
