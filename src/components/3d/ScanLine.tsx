export const ScanLine = () => {
  return (
    <>
      {/* Vertical scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div 
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan-line"
          style={{
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)'
          }}
        />
      </div>

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/50 pointer-events-none" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/50 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/50 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/50 pointer-events-none" />
    </>
  );
};
