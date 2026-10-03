import { useEffect, useState } from "react";
import { ExploreCosmos } from "./components/ExploreCosmo";
import { ExplorePage } from "./components/ExplorePage";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { HowItWorksPage } from "./components/HowItWorksPage";
import { LaunchPage } from "./components/LaunchPage";
import { ProfilePage } from "./components/ProfilePage";
import { StarfieldOverlay } from "./components/StarfieldOverlay";
import { TokenDetailsPage } from "./components/TokenDetailsPage";
import {
  LaunchpadCTA,
  LaunchpadIntro,
  TokenJourney,
} from "./components/LaunchpadSections";
import { Navbar } from "./components/Navbar";
import { useWallet } from "./components/useWallet";
import type { Address } from "viem";

const launchpadUrl = "https://ponsfamily.com/launchpad";
type Page = "home" | "explore" | "launch" | "how-it-works" | "profile" | "token";

const pageFromPath = (walletConnected: boolean): Page => {
  const path = window.location.pathname.replace(/\/+$/, "");
  if (/^\/token\/0x[a-fA-F0-9]{40}$/.test(path)) return "token";
  if (path === "/explore") return "explore";
  if (path === "/launch") return "launch";
  if (path === "/how-it-works") return "how-it-works";
  if (path === "/profile" && walletConnected) return "profile";
  return "home";
};

const tokenAddressFromPath = (): Address | null => {
  const match = window.location.pathname.match(
    /^\/token\/(0x[a-fA-F0-9]{40})\/?$/,
  );
  return match ? (match[1] as Address) : null;
};

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function App() {
  const wallet = useWallet();
  const tokenAddress = tokenAddressFromPath();
  const [page, setPage] = useState<Page>(() =>
    pageFromPath(false),
  );

  useEffect(() => {
    const handlePopState = () => {
      setPage(pageFromPath(Boolean(wallet.address)));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [wallet.address]);

  useEffect(() => {
    if (!wallet.ready || wallet.address || page !== "profile") return;
    window.history.replaceState({}, "", "/");
    setPage("home");
  }, [page, wallet.address, wallet.ready]);

  const navigate = (
    path: "/" | "/explore" | "/launch" | "/how-it-works" | "/profile",
  ) => {
    if (path === "/profile" && !wallet.address) return;
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setPage(pageFromPath(Boolean(wallet.address)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigateToToken = (address: string) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return;
    const path = `/token/${address}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    setPage("token");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openLaunchpad = () => {
    window.open(launchpadUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-300 selection:text-black">
      <StarfieldOverlay />
      <Navbar
        onExplore={() => navigate("/explore")}
        onLaunch={() => navigate("/launch")}
        onHowItWorks={() => navigate("/how-it-works")}
        onProfile={() => navigate("/profile")}
        onConnect={wallet.connect}
        onSelectAccount={wallet.selectAccount}
        onDisconnect={wallet.disconnect}
        walletAddress={wallet.address}
        walletConnecting={wallet.connecting}
        walletError={wallet.error}
        walletDetected={wallet.wallets.length > 0 || Boolean(window.ethereum)}
        pendingAccounts={wallet.pendingAccounts}
      />

      <main id="main-content">
        {page === "launch" ? (
          <LaunchPage
            onBack={() => navigate("/explore")}
            walletAddress={wallet.address}
            onConnect={wallet.connect}
            onLaunchToken={wallet.launchToken}
            onViewToken={navigateToToken}
          />
        ) : page === "how-it-works" ? (
          <HowItWorksPage
            onExplore={() => navigate("/explore")}
            onLaunch={() => navigate("/launch")}
          />
        ) : page === "profile" && wallet.address ? (
          <ProfilePage
            address={wallet.address}
            chainId={wallet.chainId}
            onExplore={() => navigate("/explore")}
            onLaunch={openLaunchpad}
            onViewToken={navigateToToken}
          />
        ) : page === "token" && tokenAddress ? (
          <TokenDetailsPage
            address={tokenAddress}
            onBack={() => navigate("/explore")}
            walletAddress={wallet.address}
            walletError={wallet.error}
            onConnect={wallet.connect}
            onTrade={wallet.tradeToken}
            onProfile={
              wallet.address ? () => navigate("/profile") : undefined
            }
          />
        ) : page === "explore" ? (
          <ExplorePage
            onLaunch={openLaunchpad}
            onTokenClick={navigateToToken}
          />
        ) : (
          <>
            <HeroSection
              onExplore={() => navigate("/explore")}
              onOpenRobinhood={openLaunchpad}
            />

            <LaunchpadIntro />

            <ExploreCosmos
              onTokenClick={(token) => {
                window.open(token.url, "_blank", "noopener,noreferrer");
              }}
              onExplore={() => navigate("/explore")}
              onLaunch={openLaunchpad}
            />

            <TokenJourney />
            <LaunchpadCTA />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
