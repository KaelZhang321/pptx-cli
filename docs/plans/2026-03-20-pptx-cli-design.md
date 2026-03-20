# pptx-cli 设计文档

## 概述

pptx-cli 是一个基于 Markdown 生成 PowerPoint 演示文稿的命令行工具。

## 需求总结

| 项目 | 选择 |
|------|------|
| 项目类型 | CLI 工具 |
| 输入格式 | Markdown |
| 技术栈 | React + pptxgenjs + TypeScript |
| 架构 | 分层架构 |
| 模板系统 | 内置3套 + 自定义JSON |
| 功能范围 | 完整（图表、表格、动画、多模板） |
| 仓库名 | pptx-cli |

## 项目结构

```
pptx-cli/
├── src/
│   ├── cli/                    # CLI 入口
│   │   ├── index.ts            # 主命令入口
│   │   └── commands/           # 子命令
│   │       ├── generate.ts     # pptx-cli generate input.md
│   │       └── init.ts         # pptx-cli init (创建示例项目)
│   │
│   ├── parser/                 # Markdown 解析
│   │   ├── index.ts            # 解析入口
│   │   ├── lexer.ts            # 词法分析
│   │   └── ast.ts              # AST 定义
│   │
│   ├── templates/              # 模板系统
│   │   ├── index.ts            # 模板加载器
│   │   ├── built-in/           # 内置模板
│   │   │   ├── default.json
│   │   │   ├── dark.json
│   │   │   └── minimal.json
│   │   └── custom-loader.ts    # 自定义模板加载
│   │
│   ├── generators/             # PPT 生成
│   │   ├── index.ts            # 生成器入口
│   │   ├── react/              # React 组件 (复杂布局)
│   │   │   ├── Slide.tsx
│   │   │   ├── Chart.tsx
│   │   │   └── Table.tsx
│   │   └── native/             # pptxgenjs 原生 (简单内容)
│   │       └── text.ts
│   │
│   └── utils/                  # 工具函数
│       ├── image.ts            # 图片处理
│       ├── chart.ts            # 图表数据转换
│       └── file.ts             # 文件操作
│
├── templates/                  # 用户自定义模板目录
├── examples/                   # 示例文件
│   └── demo.md
├── package.json
├── tsconfig.json
└── README.md
```

## Markdown 语法设计

```markdown
---
theme: default
title: 演示文稿标题
author: 作者名
---

# 第一页标题

这是正文内容，支持 **粗体** 和 *斜体*。

## 子标题

- 列表项 1
- 列表项 2

---

## 第二页 - 图片

![图片描述](./image.png)

---

## 第三页 - 代码块

```typescript
const hello = "world";
```

---

## 第四页 - 图表

```chart
type: bar
data:
  - label: Q1
    value: 100
  - label: Q2
    value: 150
```

---

## 第五页 - 表格

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |
| D   | E   | F   |

---

<!-- template: dark -->
## 第六页 - 使用 dark 模板

这页使用不同的模板。
```

### 语法特性

- YAML frontmatter 配置全局属性
- `---` 分隔幻灯片
- `##` 作为幻灯片标题
- `![]()` 图片
- ` `chart` 代码块定义图表
- 表格自动转换
- `<!-- template: xxx -->` 切换模板

## 模板系统

### 内置模板 (3套)

```json
// templates/built-in/default.json
{
  "name": "default",
  "colors": {
    "primary": "#2563EB",
    "secondary": "#64748B",
    "background": "#FFFFFF",
    "text": "#1E293B"
  },
  "fonts": {
    "title": { "name": "Arial", "size": 44 },
    "subtitle": { "name": "Arial", "size": 28 },
    "body": { "name": "Arial", "size": 18 }
  },
  "layouts": {
    "title": { "titleY": 2.5, "centered": true },
    "content": { "titleY": 0.5, "contentY": 1.5 }
  }
}
```

### 自定义模板

- 用户在 `./templates/` 目录放置 JSON 文件
- CLI 通过 `--template <name>` 或 frontmatter 指定
- 支持继承内置模板并覆盖

## CLI 命令

```bash
# 生成 PPT
pptx-cli generate input.md -o output.pptx
pptx-cli g input.md                    # 简写

# 指定模板
pptx-cli generate input.md --template dark

# 监听模式 (开发用)
pptx-cli generate input.md --watch

# 初始化示例项目
pptx-cli init my-presentation
cd my-presentation
pptx-cli generate slides.md

# 查看帮助
pptx-cli --help
pptx-cli generate --help
```

## 技术实现

### 核心依赖

```json
{
  "dependencies": {
    "pptxgenjs": "^3.12.0",
    "react": "^18.2.0",
    "react-pptx": "^0.4.0",
    "marked": "^12.0.0",
    "yaml": "^2.3.0",
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "chokidar": "^3.6.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.0",
    "vite": "^5.0.0"
  }
}
```

### 生成流程

```
Markdown → Lexer → AST → Template应用 → React组件/pptxgenjs → PPTX文件
```

### 混合渲染策略

- 简单内容 (文本、列表) → pptxgenjs 原生 API
- 复杂布局 (多列、图表) → React 组件 + react-pptx

## 下一步

1. 初始化项目 (npm init, TypeScript 配置)
2. 实现核心功能 (MVP)
3. 添加模板系统
4. 添加高级功能 (图表、表格)
5. 完善文档和测试
