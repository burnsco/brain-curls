import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/shell";
import { HomePage } from "./pages/HomePage";
import { GamesPage } from "./pages/GamesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { WorkoutPage } from "./pages/WorkoutPage";
import { GamePage } from "./pages/GamePage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useBrainCurlsState } from "./store/brain-curls-store";

function App() {
  const { settings } = useBrainCurlsState();

  useEffect(() => {
    document.documentElement.dataset.motion = settings.reducedMotion ? "reduced" : "full";
  }, [settings.reducedMotion]);

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/:slug" element={<GamePage />} />
        <Route path="/workout" element={<WorkoutPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/welcome" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

export default App;
