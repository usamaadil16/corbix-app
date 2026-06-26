### Task 1: Scaffold Next.js project and dependencies

**Files:**
- Create: `corbix-app/` (via create-next-app)
- Create: `corbix-app/.env.example`
- Create: `corbix-app/vitest.config.ts`
- Modify: `corbix-app/package.json`

**Interfaces:**
- Produces: runnable Next.js 15 app at `corbix-app/` with all dependencies installed

- [ ] **Step 1: Create Next.js app**

Run from `c:\corbix`:

```bash
npx create-next-app@latest corbix-app --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --no-turbopack
```

Expected: `corbix-app/` created with `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 2: Install dependencies**

```bash
cd corbix-app
npm install @supabase/supabase-js iron-session zod react-hook-form @hookform/resolvers framer-motion three @types/three @react-pdf/renderer sonner
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Add test script to package.json**

In `corbix-app/package.json`, add:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 5: Create .env.example**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: app at http://localhost:3000

- [ ] **Step 7: Commit**

```bash
git add corbix-app/
git commit -m "chore: scaffold corbix-app Next.js project"
```
