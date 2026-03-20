# pptx-cli

Convert Markdown to PowerPoint presentations with ease.

## Installation

```bash
npm install -g pptx-cli
```

## Usage

### Generate PPTX

```bash
pptx-cli generate slides.md -o presentation.pptx
```

### Options

- `-o, --output <file>` - Output file name (default: output.pptx)
- `-t, --template <name>` - Template name (default: default)
- `-w, --watch` - Watch for changes

### Templates

Built-in templates:
- `default` - Clean and professional
- `dark` - Dark mode theme
- `minimal` - Minimalist design

## Markdown Syntax

```markdown
---
title: My Presentation
author: Author Name
---

## First Slide Title

Content goes here...

- Bullet point 1
- Bullet point 2

---

## Second Slide Title

More content...

![Image](./image.png)
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/cli/index.js generate examples/demo.md
```

## License

MIT
