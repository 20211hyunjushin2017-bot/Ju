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

## MCP 서버

`.mcp.json`에 [21st.dev](https://21st.dev) MCP 서버가 등록되어 있습니다. API 키는 저장소에 넣지 않고 환경 변수 `TWENTYFIRST_API_KEY`로 전달합니다.

- 로컬: `export TWENTYFIRST_API_KEY=...` 후 `claude` 실행
- 클라우드 환경: 환경 설정의 Environment variables에 `TWENTYFIRST_API_KEY` 추가, Network access에 `21st.dev` 허용
