import React, { createContext, useContext } from 'react';
import { useFaceTracking } from '../utils/useFaceTracking';

const TrackingContext = createContext();

export const useTracking = () => useContext(TrackingContext);

export const TrackingProvider = ({ children }) => {
  const trackingData = useFaceTracking(true); // true to draw face mesh

  return (
    <TrackingContext.Provider value={trackingData}>
      {/* Persistent Global Camera Feed */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <video 
          ref={trackingData.videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover scale-x-[-1]" 
        />
        <canvas 
          ref={trackingData.canvasRef} 
          className="absolute top-0 left-0 w-full h-full object-cover scale-x-[-1] pointer-events-none" 
        />
      </div>
      
      {/* App Content layered on top */}
      <div className="fixed inset-0 z-10 pointer-events-auto">
        {children}
      </div>
    </TrackingContext.Provider>
  );
};
