import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FixedGameProvider } from "./contexts/FixedGameContext";
import Index from "./pages/Index";
import Play from "./pages/Play";
import Guidebook from "./pages/Guidebook";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import OfflineGame from "./pages/OfflineGame";
import OfflineSetup from "./pages/OfflineSetup";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  return (
    <FixedGameProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/play" element={<Play />} />
        <Route path="/guidebook" element={<Guidebook />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
        <Route path="/results" element={<Results />} />
        <Route path="/offline/setup" element={<OfflineSetup />} />
        <Route path="/offline/game" element={<OfflineGame />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </FixedGameProvider>
  );
}

export default App;
