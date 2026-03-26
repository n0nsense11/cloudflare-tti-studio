# Cloudflare TTI Studio

基于 Cloudflare Workers AI 的文生图/图生图应用，部署在 Cloudflare 全球边缘网络。

## 预览
![](1.png)

## 可用模型

| 模型 | 费用 | 特点 |
|------|------|------|
| DreamShaper 8 LCM | 🆓 免费 | 写实风格，LCM 加速 |
| SDXL Base 1.0 | 🆓 免费 | Stability AI 官方 SDXL 基座模型 |
| SDXL-Lightning | 🆓 免费 | 极快几步生成，ByteDance 出品 |
| SD v1.5 img2img | 🆓 免费 | 经典 SD 1.5，支持图生图 |
| FLUX.1 schnell | 付费 | 高速生成，质量优秀 |
| FLUX.2 klein 4B/9B/dev | 付费 | FLUX.2 系列 |
| Leonardo Phoenix 1.0 | 付费 | 最佳文字生成，提示词 adherence 最强 |


## 部署

```bash
# 1. 安装 Wrangler（如未安装）
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 部署
wrangler deploy
```

也可以直接通过Cloudflare Dashboard部署：  

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → 创建 Worker
2. 进入 Worker → 设置 → 绑定 → 添加绑定，类型选 **Workers AI**，变量名填写 `AI`
3. 点击编辑代码 → 左侧框粘贴 `src/worker.js` → 创建新文件 `index.html` 粘贴 `src/index.html` → 保存并部署


## 注意事项

- 免费模型配额有限，高频使用建议配置付费版或使用自己的 Cloudflare 账号
- 图片生成需 3~20 秒，请耐心等待
- UI 会根据所选模型动态显示/隐藏对应参数选项

## 致谢
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare AI](https://developers.cloudflare.com/workers-ai/)
- [Text2img-Cloudflare-Workers](https://github.com/huarzone/Text2img-Cloudflare-Workers)
