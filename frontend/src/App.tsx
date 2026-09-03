import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { AppStoreProvider } from './store/AppStore';
import { ControlRoom } from './pages/ControlRoom';
import { Negotiations } from './pages/Negotiations';
import { PolicyFirewall } from './pages/PolicyFirewall';
import { Catalog } from './pages/Catalog';
import { Transactions } from './pages/Transactions';
import { AuditTrail } from './pages/AuditTrail';
import { Simulator } from './pages/Simulator';

function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-bg">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <TopBar />
            <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
              <Routes>
                <Route path="/" element={<ControlRoom />} />
                <Route path="/negotiations" element={<Negotiations />} />
                <Route path="/firewall" element={<PolicyFirewall />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/audit" element={<AuditTrail />} />
                <Route path="/simulator" element={<Simulator />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AppStoreProvider>
  );
}

export default App;
