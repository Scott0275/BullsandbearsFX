# BullsandbearsFX AI Coding Instructions

## Project Overview
**BullsandbearsFX** is a premium cryptocurrency and forex trading platform built with React 19, TypeScript, and Vite. It features a multi-tier investment system, AI-powered market insights via Gemini API, and role-based authentication (Investor, Tenant Admin, Super Admin).

**Key Stack:** React 19 + React Router v6 + TypeScript 5.8 + Vite 6.2 + Lucide Icons

## Architecture Patterns

### Service-Based Architecture
Services are the primary integration point between the UI and backend APIs:

- **[authService.ts](services/authService.ts)** - Handles authentication flows (signup/login/logout) with token & user data persisted to localStorage. Maps user roles to dashboard paths via `getRedirectPath()`.
- **[aiService.ts](services/aiService.ts)** - Gemini AI integration (model: `gemini-3-flash-preview`) for market sentiment analysis. Always includes fallback responses for API failures/rate-limiting.
- **[cryptoService.ts](services/cryptoService.ts)** - Fetches market data from CoinGecko API with built-in mock fallback (`MOCK_ASSETS`) when API is unreachable.
- **[apiService.ts](services/apiService.ts)** - Centralizes API base URL and request headers; import via `getHeaders()`.

### Data Flow
1. Components → Services (via async methods)
2. Services → External APIs (CoinGecko, Gemini, backend)
3. Fallback mechanisms ensure graceful degradation (mock data, professional fallback messages)

## API Service Integration Patterns

### Backend API Configuration
[apiService.ts](services/apiService.ts) provides centralized API coordination:

```typescript
// API_URL resolves in order: env var → Vercel production → localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://investment-platform-core.vercel.app';

// getHeaders() automatically includes auth token and tenant slug
const headers = getHeaders(); // { Authorization: 'Bearer token', X-Tenant-Slug: 'bullsandbearsfx' }
const headers = getHeaders('custom-token'); // Override token for custom scenarios
```

**Key Points:**
- All backend requests include `X-Tenant-Slug: 'bullsandbearsfx'` header (multi-tenant support)
- Auth token auto-injected from localStorage when present
- Use `getHeaders()` import in all services making backend calls

### Authentication API Pattern
[authService.ts](services/authService.ts) demonstrates the standard API integration:

```typescript
async login(data: any) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: getHeaders(), // ← Always use getHeaders() for consistency
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Fallback error message');
  }

  const result = await response.json();
  // Persist critical data for state hydration
  localStorage.setItem('auth_token', result.token);
  localStorage.setItem('user_data', JSON.stringify(result.user));
  return result;
}
```

**Integration Pattern:**
1. Validate response status with `!response.ok` check
2. Attempt to parse error JSON; provide fallback message
3. Throw user-friendly errors to calling code
4. Components catch errors and display in UI, never expose raw API errors

### External API Integration (Graceful Fallback)
[cryptoService.ts](services/cryptoService.ts) shows handling third-party APIs with fallback:

```typescript
export const fetchMarketData = async (): Promise<CryptoAsset[]> => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?...',
      { signal: AbortController ? new AbortController().signal : undefined }
    );
    if (!response.ok) throw new Error('API limit reached');
    const data = await response.json();
    return data.length > 0 ? data : MOCK_ASSETS; // Fallback to mock if empty
  } catch (error) {
    console.warn('Market data fetch failed, using fallback:', error);
    return MOCK_ASSETS; // ← Graceful degradation
  }
};
```

**Pattern Requirements:**
- Always catch errors and return fallback data (never let API failures crash)
- Log errors to console for debugging (don't expose to users)
- Validate API response structure before returning
- Consider abort signals for long-running requests

### AI API Integration (Professional Fallback)
[aiService.ts](services/aiService.ts) integrates Gemini API with professional error handling:

```typescript
export const getMarketInsights = async (assets: string) => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "AI insights are currently in standby mode..."; // ← Pre-auth fallback

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `...${assets}...`,
      config: { temperature: 0.5 }
    });
    return response.text?.trim() || "Market indicators suggest..."; // ← Validate response
  } catch (error: any) {
    console.warn("AI insight notice:", error.message); // Log but don't expose
    return "Institutional liquidity remains high..."; // ← Professional fallback
  }
};
```

**Integration Pattern:**
- Check for required environment variables before attempting API calls
- Always catch and convert errors to professional fallback messages
- Log raw errors for debugging; never expose to UI
- Validate API response fields exist before accessing

### Using Services in Components
Standard component pattern for API integration:

```tsx
// ✅ CORRECT: Use service directly, handle errors in component
useEffect(() => {
  const loadData = async () => {
    try {
      const market = await fetchMarketData();
      setAssets(market);
    } catch (error) {
      setError('Failed to load market data');
      console.error(error);
    }
  };
  loadData();
}, []);

// ❌ WRONG: Don't expose auth modal to internal API calls
// The AuthModal is for user-facing login/signup only
```

### Type Safety
- Core types defined in [types.ts](types.ts): `CryptoAsset`, `Plan`, `Service`, `FAQItem`
- All component props should be explicitly typed; avoid `any` except for auth payloads during integration

## UI & Routing Conventions

### Protected Routes Pattern
[App.tsx](App.tsx#L52) implements `ProtectedRoute` HOC for role-based access control:
```tsx
<ProtectedRoute user={user} allowedRoles={['INVESTOR', 'TENANT_ADMIN']}>
  <DashboardPage />
</ProtectedRoute>
```

### Authentication Modal Pattern
`AuthModal` component handles both login and signup modes. On success, updates parent component's user state and calls `onLoginSuccess()` callback—do not fetch user data directly within the modal.

### Constants & Configuration
- [constants.tsx](constants.tsx) centralizes: `INVESTMENT_PLANS` (Starter/Silver/Gold/Platinum tiers with ROI), `SERVICES`, `WHY_CHOOSE_US`, `FAQS`, `TESTIMONIALS`
- Investment plans use color-coded Tailwind classes (e.g., `bg-emerald-500/20 text-emerald-400` for Starter tier)
- All plan data is immutable and should not be modified in components

## Environment & Build

### Required Environment Variables
- `GEMINI_API_KEY` - Set in `.env.local` for Gemini API access
- Both `process.env.API_KEY` and `process.env.GEMINI_API_KEY` are defined in [vite.config.ts](vite.config.ts)

### Development & Build
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run preview      # Preview production build
```

### Key Build Details
- Vite dev server runs on `0.0.0.0:3000` (accessible from any network interface)
- React Fast Refresh enabled via `@vitejs/plugin-react`
- Path alias `@` maps to project root (currently unused but available)

## Common Development Tasks

### Adding a New Investment Plan
1. Add new plan object to `INVESTMENT_PLANS` array in [constants.tsx](constants.tsx) with: `name`, `range`, `roi`, `features[]`, `color` (Tailwind), `accent` (bg/text class)
2. Update corresponding investment plan UI component to render the new tier
3. No need to modify types—`Plan` interface already supports the structure

### Integrating New Market Data
1. Add crypto asset to mock data in [cryptoService.ts](services/cryptoService.ts) following `CryptoAsset` interface
2. If adding real API, preserve fallback to `MOCK_ASSETS` on network failure
3. Service methods must be async and handle errors gracefully

### Adding AI Insights to New Features
1. Call `getMarketInsights()` from [aiService.ts](services/aiService.ts) with asset symbols (e.g., "BTC, ETH, SOL")
2. Always handle API failures—service returns professional fallback message
3. Do not expose raw API errors to users; log to console for debugging

### Role-Based UI Changes
1. Get current user via `authService.getCurrentUser()` 
2. Check `user.role` against the role mapping in [authService.ts](services/authService.ts): `SUPER_ADMIN`, `TENANT_ADMIN`, `INVESTOR`
3. Use `ProtectedRoute` for entire pages; use conditional rendering for feature-level access

## Critical Patterns to Follow

- **Error Handling:** Always catch async errors in services and return user-friendly fallbacks; log raw errors to console
- **localStorage Usage:** Only persist `auth_token` and `user_data`; validate/sanitize on retrieval to prevent corruption
- **Component Lifecycle:** Use `useEffect` for API calls; cleanup abort signals in cleanup functions (see cryptoService timeout example)
- **Lucide Icons:** All icons imported from `lucide-react`; avoid hardcoding SVG paths
- **Token Management:** Services handle token storage/retrieval; do not expose tokens in component state when possible

## Files to Review First
1. [App.tsx](App.tsx) - Main routing logic, authentication state, protected routes
2. [types.ts](types.ts) - Interface definitions for type safety
3. [services/authService.ts](services/authService.ts) - Auth flow and user role mapping
4. [constants.tsx](constants.tsx) - Data structures (plans, services, FAQs, testimonials)
