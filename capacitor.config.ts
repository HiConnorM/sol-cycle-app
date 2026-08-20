import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.solcycle',
  appName: 'Sol Cycle',
  // Next.js static export output. Run `pnpm build` before `npx cap sync`.
  webDir: 'out',
  ios: {
    // The app paints its own background behind the status bar and uses
    // safe-area insets throughout, so the web view runs edge to edge.
    contentInset: 'never',
    // Matches --background in app/globals.css; prevents a white flash between
    // the splash screen and first paint.
    backgroundColor: '#F7F5F2',
    // Bounce scrolling is handled per-container in CSS; disabling it globally
    // stops the whole document rubber-banding behind the fixed bottom nav.
    scrollEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false, // hidden from the app once React has painted
      backgroundColor: '#F7F5F2',
      showSpinner: false,
    },
    StatusBar: {
      // The web content runs under the status bar so the app's own themed
      // background shows there — otherwise the strip stays a hardcoded light
      // colour while the app is in dark mode. Every screen header carries
      // `safe-area-pt`, so nothing lands under the Dynamic Island.
      // (`backgroundColor` is Android-only and would be a no-op here.)
      overlaysWebView: true,
      style: 'DEFAULT',
    },
  },
}

export default config
