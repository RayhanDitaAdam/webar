import React from 'react';
import { GameProvider, useGameState } from './game/GameStateContext';
import { LandingPage } from './components/LandingPage';
import { Level1SkyGazer } from './levels/Level1SkyGazer';
import { Level2LeftRight } from './levels/Level2LeftRight';
import { Level3EarToShoulder } from './levels/Level3EarToShoulder';
import { Level4Circular } from './levels/Level4Circular';
import { Level5Dodge } from './levels/Level5Dodge';
import { Level6Zen } from './levels/Level6Zen';
import { TrackingProvider } from './game/TrackingContext';
import './index.css';

const GameRouter = () => {
  const { currentLevel } = useGameState();

  switch (currentLevel) {
    case 0: return <LandingPage />;
    case 1: return <Level1SkyGazer />;
    case 2: return <Level2LeftRight />;
    case 3: return <Level3EarToShoulder />;
    case 4: return <Level4Circular />;
    case 5: return <Level5Dodge />;
    case 6: return <Level6Zen />;
    default: return <LandingPage />;
  }
};

function App() {
  return (
    <GameProvider>
      <TrackingProvider>
        <GameRouter />
      </TrackingProvider>
    </GameProvider>
  );
}

export default App;
