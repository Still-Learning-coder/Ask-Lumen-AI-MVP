import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import RightPanel from "@/components/layout/RightPanel";
import ChatInterface from "@/components/chat/ChatInterface";
import { Button } from "@/components/ui/button";
import { PanelRightClose, PanelRightOpen, Zap } from "lucide-react";
import { ParticleField } from "@/components/3d/ParticleField";
import { HolographicGrid } from "@/components/3d/HolographicGrid";
import { ScanLine } from "@/components/3d/ScanLine";
import { FloatingOrb } from "@/components/3d/FloatingOrb";

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-background relative overflow-hidden">
      {/* 3D Background Effects */}
      {mounted && (
        <>
          <ParticleField />
          <HolographicGrid />
          <FloatingOrb />
          <ScanLine />
        </>
      )}

      {/* Holographic overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <div className="flex-1 flex flex-col relative z-10">
        {/* Sci-Fi Header */}
        <header className="h-16 border-b border-cyan-500/20 bg-card/50 backdrop-blur-xl flex items-center justify-between px-6 glass-panel relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl animate-pulse-glow" />
              <Zap className="h-6 w-6 text-cyan-500 relative z-10" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Ask Lumen AI
            </h1>
            <div className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
              v3.0
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-cyan-500/10 hover:text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
          >
            {rightPanelOpen ? (
              <PanelRightClose className="h-5 w-5" />
            ) : (
              <PanelRightOpen className="h-5 w-5" />
            )}
          </Button>
        </header>

        <ChatInterface />
      </div>

      <RightPanel isOpen={rightPanelOpen} />
    </div>
  );
};

export default Dashboard;
