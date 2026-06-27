import { Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Landing } from './screens/Landing'
import { Login } from './screens/Login'
import { Home } from './screens/Home'
import { Walk } from './screens/Walk'
import { Community } from './screens/Community'
import { Events } from './screens/Events'
import { Profile } from './screens/Profile'
import { Eco } from './screens/Eco'
import { History } from './screens/History'
import { Partners } from './screens/Partners'
import { isAuthed } from './lib/auth'

/** Layout apki za logowaniem — responsywny shell (www ↔ telefon). */
function ProtectedLayout() {
  if (!isAuthed()) return <Navigate to="/login" replace />
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

function App() {
  return (
    <Routes>
      {/* publiczne */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* aplikacja (chroniona) */}
      <Route path="/app" element={<ProtectedLayout />}>
        <Route index element={<Home />} />
      </Route>
      <Route element={<ProtectedLayout />}>
        <Route path="/walk" element={<Walk />} />
        <Route path="/community" element={<Community />} />
        <Route path="/events" element={<Events />} />
        <Route path="/eco" element={<Eco />} />
        <Route path="/history" element={<History />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
