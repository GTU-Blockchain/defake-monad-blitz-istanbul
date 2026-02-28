import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { monadTestnet } from "./config/monad";
import App from "./App";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";

const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: { [monadTestnet.id]: http() },
});

const queryClient = new QueryClient();

const obscuraTheme = darkTheme({
  accentColor: "#2081e2",
  accentColorForeground: "white",
  borderRadius: "small",
  fontStack: "system",
  overlayBlur: "small",
});

// Override specific modal styles to match Obscura
obscuraTheme.colors.connectButtonBackground = "transparent";
obscuraTheme.colors.modalBackground = "#0a0a0f";
obscuraTheme.colors.modalBorder = "#1a1a2e";
obscuraTheme.colors.profileForeground = "#0d0d14";
obscuraTheme.colors.actionButtonBorder = "#1a1a2e";
obscuraTheme.colors.actionButtonSecondaryBackground = "#12121f";
obscuraTheme.colors.menuItemBackground = "#12121f";
obscuraTheme.fonts.body = "'JetBrains Mono', monospace";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={obscuraTheme}
          appInfo={{
            appName: "Obscura",
            learnMoreUrl:
              "https://github.com/GTU-Blockchain/defake-monad-blitz-istanbul",
          }}
          avatar={({ size }) =>
            React.createElement("img", {
              src: "/logo.svg",
              alt: "Obscura",
              width: size,
              height: size,
              style: { borderRadius: 4 },
            })
          }
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
