import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import AuthCallback from '@/pages/AuthCallback'
import Home from '@/pages/Home'
import PlatformPage from '@/pages/PlatformPage'
import Settings from '@/pages/Settings'
import WatchPage from '@/pages/WatchPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="platform/:provider" element={<PlatformPage />} />
          <Route path="watch/:provider/:videoId" element={<WatchPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/auth/:provider/callback" element={<AuthCallback />} />
      </Routes>
    </Router>
  )
}
