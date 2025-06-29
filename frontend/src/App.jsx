import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Matches from "./pages/match/Matches";
import MatchDetail from "./pages/match/MatchDetail";
import Teams from "./pages/team/Teams";
import User from "./pages/user/User";
import Error from "./pages/Error";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:match_uuid" element={<MatchDetail />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/user" element={<User />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
