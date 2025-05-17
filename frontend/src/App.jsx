import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import Home from './pages/Home'
import Matches from './pages/Matches'
import Teams from './pages/Teams'
import Error from './pages/Error'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App;
