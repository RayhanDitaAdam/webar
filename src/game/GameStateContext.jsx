import React, { createContext, useContext, useState, useEffect } from 'react';

const GameStateContext = createContext();

export const useGameState = () => useContext(GameStateContext);

export const GameProvider = ({ children }) => {
  const [currentLevel, setCurrentLevel] = useState(0); // 0 = menu, 1-6 = levels
  const [unlockedLevels, setUnlockedLevels] = useState([1]); // Level 1 is unlocked initially
  const [scores, setScores] = useState({});
  const [userData, setUserData] = useState(null); // { username, email }
  const [album, setAlbum] = useState([]); // [{ type: 'photo'|'video', url: string }]

  // Load state from local storage (optional, for persistence)
  useEffect(() => {
    const saved = localStorage.getItem('webar-neck-game');
    if (saved) {
      try {
        const { unlocked, savedScores, savedUserData } = JSON.parse(saved);
        if (unlocked) setUnlockedLevels(unlocked);
        if (savedScores) setScores(savedScores);
        if (savedUserData) setUserData(savedUserData);
      } catch (e) {
        console.error("Failed to parse saved game state");
      }
    }
  }, []);

  const completeLevel = (levelNum, score = 0) => {
    setScores(prev => {
      const newScores = { ...prev, [levelNum]: Math.max(score, prev[levelNum] || 0) };
      
      const newUnlocked = [...unlockedLevels];
      if (levelNum < 6 && !newUnlocked.includes(levelNum + 1)) {
        newUnlocked.push(levelNum + 1);
      }
      
      setUnlockedLevels(newUnlocked);
      localStorage.setItem('webar-neck-game', JSON.stringify({
        unlocked: newUnlocked,
        savedScores: newScores,
        savedUserData: userData
      }));
      
      return newScores;
    });

    // Optionally auto-advance or let user go back to menu manually
    // setCurrentLevel(0); 
  };

  const resetProgress = () => {
    setUnlockedLevels([1]);
    setScores({});
    setUserData(null);
    localStorage.removeItem('webar-neck-game');
  };

  const saveUserData = (data) => {
    setUserData(data);
    localStorage.setItem('webar-neck-game', JSON.stringify({
      unlocked: unlockedLevels,
      savedScores: scores,
      savedUserData: data
    }));
  };

  const addToAlbum = (item) => {
    setAlbum(prev => [...prev, { ...item, id: Date.now() }]);
  };

  const clearAlbum = () => setAlbum([]);

  const goToMenu = () => setCurrentLevel(0);
  const startLevel = (levelNum) => {
    if (unlockedLevels.includes(levelNum)) {
      setCurrentLevel(levelNum);
    }
  };

  return (
    <GameStateContext.Provider value={{
      currentLevel,
      unlockedLevels,
      scores,
      userData,
      album,
      completeLevel,
      resetProgress,
      goToMenu,
      startLevel,
      saveUserData,
      addToAlbum,
      clearAlbum
    }}>
      {children}
    </GameStateContext.Provider>
  );
};
