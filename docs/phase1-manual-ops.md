# Phase 1 手动运营手册

本手册覆盖 `包袋 / 小皮具` Phase 1 的人工解锁与交付流程。当前默认模式是：

`预览免费 -> 人工确认 -> 解锁下载完整素材包`

## 1. 用户提交解锁申请后

1. 在 Supabase 打开 `unlock_requests` 表。
2. 按 `created_at desc` 查看最新申请。
3. 核对以下字段：
   - `model_id`
   - `contact_name`
   - `contact_channel`
   - `contact_value`
   - `note`
   - `status`
4. 确认对应 `model_id` 在 `models` 表里存在，且 `metadata.workflowType = seller_asset_pack_phase1`。

## 2. 人工审核通过

在 `unlock_requests` 表中更新目标记录：

- `status = approved`
- `approved_at = 当前时间`

如果审核不通过：

- `status = rejected`
- `rejected_at = 当前时间`

## 3. 完成交付并标记解锁

当前交付动作是用户在生成页点击 ZIP 下载。人工确认通过后，需要把请求同步到“已解锁”状态：

1. 在 `unlock_requests` 表中更新：
   - `status = unlocked`
   - `fulfilled_at = 当前时间`
2. 在 `models` 表中同步更新 `metadata.unlockStatus = unlocked`。

推荐同步写法：

```json
{
  "workflowType": "seller_asset_pack_phase1",
  "category": "bags",
  "presetKey": "bag-studio-phase1",
  "unlockStatus": "unlocked"
}
```

保留原有 `analysisSummary`、`assetPackSnapshot`、`assetPackPreviewReady` 等字段，不要覆盖掉整段 metadata。

## 4. 让共享状态逻辑生效

前端列表和结果页统一通过 `deriveUnlockView(...)` 派生状态。为了让两条读路径保持一致：

1. `unlock_requests.status` 必须更新为真实状态。
2. `models.metadata.unlockStatus` 也必须同步到相同状态。

如果只改一侧，Dashboard 和结果页可能出现短暂不一致。

## 5. 联系用户交付

推荐联系顺序：

1. 通过用户提交的 `contact_channel + contact_value` 通知“审核通过”。
2. 引导用户回到 `/generate` 查看结果页并下载 ZIP。
3. 若用户反馈下载失败，优先核对：
   - `unlock_requests.status` 是否已为 `unlocked`
   - `models.metadata.assetPackPreviewReady` 是否为 `true`
   - `models.model_3d_url` 是否存在
   - `models.metadata.assetPackSnapshot.manifest.assets[]` 是否完整

## 6. 常见排查项

- 用户看不到解锁入口：检查 `unlockStatus` 是否仍是 `preview_only` 或 `rejected`。
- 用户看不到下载按钮：检查 `unlockStatus` 是否已是 `unlocked`。
- ZIP 下载报错：优先检查 `model_3d_url` 是否有效，因为 `model/model.glb` 必须实际写入 ZIP。
