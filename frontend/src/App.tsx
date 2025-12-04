import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import Home from './pages/Home';
import CreateGiftCard from './pages/CreateGiftCard';
import MyGifts from './pages/MyGifts';
import Marketplace from './pages/Marketplace';
import ListArt from './pages/ListArt';
import ClaimGift from './pages/ClaimGift';
import { ToastProvider } from './components/ToastContainer';
import { CustomConnectButton } from './components/CustomConnectButton';
import { cn } from './lib/utils';
import LightRays from './components/LightRays';

function App() {
  const { isConnected, chain } = useAccount();
  const isWrongNetwork = isConnected && chain?.id !== 80002;

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative">
          {/* Deep Tech Background */}
          <div className="deep-tech-bg" />

          {/* Light Rays Background - Behind Everything */}
          <div className="fixed top-0 left-0 right-0 bottom-0 z-0">
            <LightRays
              raysOrigin="top-center"
              raysColor="#a855f7"
              raysSpeed={1.5}
              lightSpread={0.8}
              rayLength={1.2}
              followMouse={true}
              mouseInfluence={0.1}
              noiseAmount={0.1}
              distortion={0.05}
            />
          </div>

          {/* Header - Fixed */}
          <header className="fixed top-0 left-0 right-0 z-50 py-4">
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="container mx-auto px-4">
                {/* Compact Navbar */}
                <div className="max-w-4xl mx-auto bg-zinc-900/90 backdrop-blur-md rounded-2xl border border-white/10 px-6 py-3">
                  <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link
                      to="/"
                      className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity"
                    >
                      CRYPT
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8">
                      <NavLink to="/create">Create</NavLink>
                      <NavLink to="/my-gifts">My Gifts</NavLink>
                      <NavLink to="/marketplace">Marketplace</NavLink>
                      <NavLink to="/list-art">List Art</NavLink>
                    </nav>

                    {/* Connect Button */}
                    <div className="flex items-center">
                      <CustomConnectButton />
                    </div>
                  </div>
                </div>

                {/* Wrong Network Warning */}
                {isWrongNetwork && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto mt-3 py-2 px-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm"
                  >
                    ⚠️ Wrong Network! Please switch to Polygon Amoy testnet
                  </motion.div>
                )}
              </div>
            </motion.div>
          </header>

          {/* Main Content */}
          <main className="flex-1 relative z-10 pt-24">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateGiftCard />} />
              <Route path="/my-gifts" element={<MyGifts />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/list-art" element={<ListArt />} />
              <Route path="/claim" element={<ClaimGift />} />
            </Routes>
          </main>


        </div>
      </Router>
    </ToastProvider>
  );
}

// NavLink Component
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={cn(
        "text-slate-400 hover:text-slate-200 transition-colors duration-200",
        "font-medium text-sm tracking-tight"
      )}
    >
      {children}
    </Link>
  );
}

export default App;
