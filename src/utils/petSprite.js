// 宠物精灵图为 codex atlas 格式：1536x1872，8 列 x 9 行，每格 192x208（左上角为 idle 帧）
export const PET_ATLAS_COLS = 8
export const PET_ATLAS_ROWS = 9
export const PET_FRAME_W = 192
export const PET_FRAME_H = 208

// 用背景定位从精灵图切出左上角 idle 帧，作为静态预览
export function petFrameStyle(imageUrl, width = 96) {
  const scale = width / PET_FRAME_W
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: `${width * PET_ATLAS_COLS}px ${PET_FRAME_H * scale * PET_ATLAS_ROWS}px`,
    backgroundPosition: '0% 0%',
    backgroundRepeat: 'no-repeat',
    width: `${width}px`,
    height: `${Math.round(PET_FRAME_H * scale)}px`,
  }
}
