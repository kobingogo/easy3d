# Phase 2A 批量上新手动运营手册

本手册覆盖 Phase 2A 的批次工作流人工干预动作：

`创建批次 -> 队列推进 -> 失败重试 -> 批量导出`

当前仍聚焦 `包袋 / 小皮具`，默认单批次上限 20 项，并发 3。

## 1. 关键数据表

核心数据位于：

1. `batch_jobs`
2. `batch_items`
3. `models`
4. `unlock_requests`

建议排查顺序：先看 `batch_jobs` 聚合计数，再看 `batch_items` 明细，最后核对 `models` 实际状态。

## 2. 批次推进的操作路径

前端路径：

1. 进入 `/dashboard`
2. 创建批次并上传商品图
3. 进入 `/dashboard/batches/:id`
4. 点击「推进队列」

接口路径：

1. `POST /api/batches/:id/process`
2. 该接口会先同步处理中任务状态，再领取新任务
3. 领取成功后写入 `model_id + trip_task_id`

## 3. 失败项重试

仅 `failed` 子任务允许重试：

1. 前端在批次详情页点击「重试」
2. 后端调用 `POST /api/batches/:id/items/:itemId/retry`
3. 子任务状态从 `failed -> queued`

如果重试按钮不可用，先检查：

1. `batch_items.status` 是否真为 `failed`
2. `batch_items.last_error` 是否有可读报错
3. 子任务是否误处于 `processing`（可先再次执行 process 同步状态）

## 4. 导出规则与失败排查

批量导出入口：`GET /api/batches/:id/download`

导出规则：

1. 仅导出 `completed` 且 `unlockStatus=unlocked` 的子任务
2. 导出结果是一个批次 ZIP，内含每个子任务的清单、文案、策略和链接文件
3. 若没有可导出项，会返回 400

常见导出失败原因：

1. 批次里虽然 `completed`，但 `models.metadata.unlockStatus` 不是 `unlocked`
2. `model_id` 丢失或关联模型不存在
3. 对应模型 `metadata.assetPackSnapshot` 缺失

## 5. 运维核对清单

每天建议至少核对一次：

1. 有无长期 `processing` 且 `updated_at` 超时的子任务
2. 有无高频 `failed` 且 `last_error` 相同（可定位系统性异常）
3. 导出失败批次数量是否异常升高

## 6. 手动修复建议

当出现异常卡住：

1. 优先执行一次 `POST /api/batches/:id/process` 触发状态同步
2. 对确认失败项使用 retry 回队列
3. 必要时在 Supabase 手动修正 `batch_items.status`，并再次 process 让聚合计数回正

手动改表后，务必刷新批次详情页确认：

1. `queued_count / processing_count / completed_count / failed_count` 与明细一致
2. 状态是否符合预期（`running / partial_failed / completed`）
