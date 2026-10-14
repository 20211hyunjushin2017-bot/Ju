// 이미지 경로. 오프라인용 단일 HTML 파일에서는 이미지가 window.__OCEAN_IMAGES에 미리 들어 있어 그걸 씁니다.
declare global {
  interface Window {
    __OCEAN_IMAGES?: Record<string, string>
  }
}

export const imgUrl = (name: string) => window.__OCEAN_IMAGES?.[name] ?? `${import.meta.env.BASE_URL}images/${name}`
