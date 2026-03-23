export type Phase1Category = 'bags'

export type UnlockStatus =
  | 'preview_only'
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'unlocked'

export interface Phase1Preset {
  key: 'bag-studio-phase1'
  category: Phase1Category
  label: string
  description: string
  copyTone: string
  targetPlatforms: Array<'taobao' | 'xiaohongshu' | 'douyin'>
}
