# Ju

React + TypeScript + Vite 프로젝트이며, 애니메이션은 [Motion for React](https://motion.dev/docs/react)(`motion` 패키지)를 사용합니다.

## 실행

```bash
npm install
npm run dev
```

## Motion 사용법

```tsx
import { motion, AnimatePresence } from 'motion/react'

<motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} />
```

예제(회전·진입·hover/tap·layout·exit·scroll)는 `src/App.tsx`에 있습니다.

## Claude Code 스킬

`.claude/skills/`에 UI UX Pro Max 스킬 묶음이 설치되어 있습니다.
