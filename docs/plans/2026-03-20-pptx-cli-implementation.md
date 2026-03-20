# pptx-cli Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a CLI tool that converts Markdown files to PowerPoint presentations using React + pptxgenjs.

**Architecture:** Layered architecture with CLI entry, Markdown parser, template system, and PPT generator. React components handle complex layouts, pptxgenjs handles simple content.

**Tech Stack:** TypeScript, Node.js, pptxgenjs, react-pptx, marked, commander, chalk

---

## Phase 1: Project Setup

### Task 1: Initialize npm project

**Files:**
- Create: `package.json`

**Step 1: Initialize npm project**

```bash
npm init -y
```

**Step 2: Update package.json with project info**

```json
{
  "name": "pptx-cli",
  "version": "0.1.0",
  "description": "Convert Markdown to PowerPoint presentations",
  "type": "module",
  "bin": {
    "pptx-cli": "./dist/cli/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/cli/index.js"
  },
  "keywords": ["pptx", "markdown", "ppt", "cli", "powerpoint"],
  "author": "",
  "license": "MIT"
}
```

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: initialize npm project"
```

---

### Task 2: Setup TypeScript

**Files:**
- Create: `tsconfig.json`

**Step 1: Install TypeScript dependencies**

```bash
npm install -D typescript @types/node ts-node
```

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Commit**

```bash
git add tsconfig.json package.json package-lock.json
git commit -m "chore: setup TypeScript"
```

---

### Task 3: Create .gitignore

**Files:**
- Create: `.gitignore`

**Step 1: Create .gitignore**

```
# Dependencies
node_modules/

# Build output
dist/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Test output
coverage/

# Temporary files
*.tmp
*.temp

# Generated PPTX files (optional, uncomment if needed)
# *.pptx
```

**Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```

---

### Task 4: Install core dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install production dependencies**

```bash
npm install pptxgenjs marked yaml commander chalk
```

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install core dependencies"
```

---

### Task 5: Create project structure

**Files:**
- Create: `src/cli/index.ts`
- Create: `src/parser/index.ts`
- Create: `src/templates/index.ts`
- Create: `src/generators/index.ts`
- Create: `src/utils/index.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/cli/commands
mkdir -p src/parser
mkdir -p src/templates/built-in
mkdir -p src/generators/react
mkdir -p src/generators/native
mkdir -p src/utils
mkdir -p examples
mkdir -p templates
```

**Step 2: Create placeholder files**

```bash
# CLI entry
cat > src/cli/index.ts << 'EOF'
#!/usr/bin/env node

console.log('pptx-cli - Markdown to PowerPoint');
EOF

# Parser placeholder
cat > src/parser/index.ts << 'EOF'
// Markdown parser
export {};
EOF

# Templates placeholder
cat > src/templates/index.ts << 'EOF'
// Template system
export {};
EOF

# Generators placeholder
cat > src/generators/index.ts << 'EOF'
// PPT generators
export {};
EOF

# Utils placeholder
cat > src/utils/index.ts << 'EOF'
// Utility functions
export {};
EOF
```

**Step 3: Commit**

```bash
git add src/
git commit -m "chore: create project structure"
```

---

## Phase 2: CLI Foundation

### Task 6: Implement CLI entry with commander

**Files:**
- Modify: `src/cli/index.ts`

**Step 1: Update CLI entry**

```typescript
#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('pptx-cli')
  .description('Convert Markdown to PowerPoint presentations')
  .version('0.1.0');

program
  .command('generate <input>')
  .description('Generate PPTX from Markdown file')
  .option('-o, --output <file>', 'Output file name', 'output.pptx')
  .option('-t, --template <name>', 'Template name', 'default')
  .option('-w, --watch', 'Watch for changes', false)
  .action(async (input: string, options: { output: string; template: string; watch: boolean }) => {
    console.log(`Generating PPTX from ${input}`);
    console.log(`Output: ${options.output}`);
    console.log(`Template: ${options.template}`);
    // TODO: Implement generation
  });

program
  .command('init [name]')
  .description('Initialize a new presentation project')
  .action(async (name: string = 'my-presentation') => {
    console.log(`Initializing ${name}...`);
    // TODO: Implement init
  });

program.parse();
```

**Step 2: Build and test**

```bash
npm run build
node dist/cli/index.js --help
```

Expected: Shows help message with available commands

**Step 3: Commit**

```bash
git add src/cli/index.ts
git commit -m "feat: implement CLI entry with commander"
```

---

## Phase 3: Markdown Parser

### Task 7: Define AST types

**Files:**
- Create: `src/parser/ast.ts`

**Step 1: Create AST type definitions**

```typescript
export interface SlideMeta {
  theme?: string;
  title?: string;
  author?: string;
  template?: string;
}

export interface TextContent {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export interface ImageContent {
  type: 'image';
  src: string;
  alt?: string;
}

export interface CodeContent {
  type: 'code';
  language: string;
  code: string;
}

export interface ChartContent {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie';
  data: Array<{ label: string; value: number }>;
}

export interface TableContent {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface ListContent {
  type: 'list';
  items: string[];
  ordered: boolean;
}

export type SlideContent = 
  | TextContent 
  | ImageContent 
  | CodeContent 
  | ChartContent 
  | TableContent 
  | ListContent;

export interface Slide {
  title: string;
  template?: string;
  contents: SlideContent[];
}

export interface Presentation {
  meta: SlideMeta;
  slides: Slide[];
}
```

**Step 2: Commit**

```bash
git add src/parser/ast.ts
git commit -m "feat: define AST types for presentation"
```

---

### Task 8: Implement Markdown parser

**Files:**
- Modify: `src/parser/index.ts`
- Create: `src/parser/lexer.ts`

**Step 1: Create lexer for Markdown parsing**

```typescript
import { marked } from 'marked';
import yaml from 'yaml';
import type { Presentation, Slide, SlideContent, SlideMeta } from './ast.js';

export class MarkdownParser {
  async parse(markdown: string): Promise<Presentation> {
    const sections = this.splitSlides(markdown);
    const { meta, content } = this.parseFrontmatter(sections[0]);
    
    const slides: Slide[] = [];
    
    // First section might have content
    if (content.trim()) {
      slides.push(this.parseSlide(content));
    }
    
    // Parse remaining sections
    for (let i = 1; i < sections.length; i++) {
      slides.push(this.parseSlide(sections[i]));
    }
    
    return { meta, slides };
  }

  private splitSlides(markdown: string): string[] {
    // Split by horizontal rules (---)
    return markdown.split(/\n---\n/);
  }

  private parseFrontmatter(section: string): { meta: SlideMeta; content: string } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = section.match(frontmatterRegex);
    
    if (match) {
      const meta = yaml.parse(match[1]) as SlideMeta;
      return { meta, content: match[2] };
    }
    
    return { meta: {}, content: section };
  }

  private parseSlide(markdown: string): Slide {
    const lines = markdown.trim().split('\n');
    let title = '';
    let template: string | undefined;
    const contents: SlideContent[] = [];

    for (const line of lines) {
      // Check for template directive
      const templateMatch = line.match(/<!--\s*template:\s*(\w+)\s*-->/);
      if (templateMatch) {
        template = templateMatch[1];
        continue;
      }

      // H2 is slide title
      const titleMatch = line.match(/^##\s+(.+)$/);
      if (titleMatch) {
        title = titleMatch[1];
        continue;
      }

      // H1 becomes title if no H2
      const h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match && !title) {
        title = h1Match[1];
        continue;
      }

      // Skip empty lines
      if (!line.trim()) continue;

      // Parse content (simplified for MVP)
      contents.push(this.parseLine(line));
    }

    return { title, template, contents };
  }

  private parseLine(line: string): SlideContent {
    // Image
    const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      return { type: 'image', alt: imgMatch[1], src: imgMatch[2] };
    }

    // List item
    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      return { type: 'list', items: [listMatch[1]], ordered: false };
    }

    // Default to text
    return { type: 'text', text: line };
  }
}

export const parser = new MarkdownParser();
```

**Step 2: Update parser index**

```typescript
export { MarkdownParser, parser } from './lexer.js';
export type { Presentation, Slide, SlideContent, SlideMeta } from './ast.js';
```

**Step 3: Commit**

```bash
git add src/parser/
git commit -m "feat: implement Markdown parser"
```

---

## Phase 4: Template System

### Task 9: Create default template

**Files:**
- Create: `src/templates/built-in/default.json`
- Create: `src/templates/built-in/dark.json`
- Create: `src/templates/built-in/minimal.json`

**Step 1: Create default template**

```json
{
  "name": "default",
  "colors": {
    "primary": "#2563EB",
    "secondary": "#64748B",
    "background": "#FFFFFF",
    "text": "#1E293B",
    "accent": "#3B82F6"
  },
  "fonts": {
    "title": { "name": "Arial", "size": 44, "bold": true },
    "subtitle": { "name": "Arial", "size": 28 },
    "body": { "name": "Arial", "size": 18 }
  },
  "layouts": {
    "title": {
      "titleX": 0.5,
      "titleY": 2.5,
      "titleW": 9,
      "titleH": 1,
      "centered": true
    },
    "content": {
      "titleX": 0.5,
      "titleY": 0.5,
      "titleW": 9,
      "contentX": 0.5,
      "contentY": 1.5,
      "contentW": 9
    }
  },
  "slide": {
    "width": 10,
    "height": 7.5
  }
}
```

**Step 2: Create dark template**

```json
{
  "name": "dark",
  "colors": {
    "primary": "#60A5FA",
    "secondary": "#94A3B8",
    "background": "#1E293B",
    "text": "#F1F5F9",
    "accent": "#3B82F6"
  },
  "fonts": {
    "title": { "name": "Arial", "size": 44, "bold": true },
    "subtitle": { "name": "Arial", "size": 28 },
    "body": { "name": "Arial", "size": 18 }
  },
  "layouts": {
    "title": {
      "titleX": 0.5,
      "titleY": 2.5,
      "titleW": 9,
      "titleH": 1,
      "centered": true
    },
    "content": {
      "titleX": 0.5,
      "titleY": 0.5,
      "titleW": 9,
      "contentX": 0.5,
      "contentY": 1.5,
      "contentW": 9
    }
  },
  "slide": {
    "width": 10,
    "height": 7.5
  }
}
```

**Step 3: Create minimal template**

```json
{
  "name": "minimal",
  "colors": {
    "primary": "#000000",
    "secondary": "#666666",
    "background": "#FFFFFF",
    "text": "#333333",
    "accent": "#000000"
  },
  "fonts": {
    "title": { "name": "Arial", "size": 36, "bold": true },
    "subtitle": { "name": "Arial", "size": 24 },
    "body": { "name": "Arial", "size": 16 }
  },
  "layouts": {
    "title": {
      "titleX": 0.5,
      "titleY": 3,
      "titleW": 9,
      "titleH": 1,
      "centered": true
    },
    "content": {
      "titleX": 0.5,
      "titleY": 0.5,
      "titleW": 9,
      "contentX": 0.5,
      "contentY": 1.5,
      "contentW": 9
    }
  },
  "slide": {
    "width": 10,
    "height": 7.5
  }
}
```

**Step 4: Commit**

```bash
git add src/templates/built-in/
git commit -m "feat: add built-in templates"
```

---

### Task 10: Implement template loader

**Files:**
- Modify: `src/templates/index.ts`

**Step 1: Create template loader**

```typescript
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Template {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    title: { name: string; size: number; bold?: boolean };
    subtitle: { name: string; size: number };
    body: { name: string; size: number };
  };
  layouts: {
    title: Record<string, unknown>;
    content: Record<string, unknown>;
  };
  slide: {
    width: number;
    height: number;
  };
}

class TemplateLoader {
  private templates: Map<string, Template> = new Map();
  private loaded = false;

  async load(): Promise<void> {
    if (this.loaded) return;

    const builtInPath = join(__dirname, 'built-in');
    const files = await readdir(builtInPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await readFile(join(builtInPath, file), 'utf-8');
        const template = JSON.parse(content) as Template;
        this.templates.set(template.name, template);
      }
    }

    this.loaded = true;
  }

  async get(name: string): Promise<Template | undefined> {
    await this.load();
    return this.templates.get(name);
  }

  async list(): Promise<string[]> {
    await this.load();
    return Array.from(this.templates.keys());
  }

  async loadCustom(path: string): Promise<Template> {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as Template;
  }
}

export const templateLoader = new TemplateLoader();
```

**Step 2: Commit**

```bash
git add src/templates/index.ts
git commit -m "feat: implement template loader"
```

---

## Phase 5: PPT Generator

### Task 11: Implement PPTX generator

**Files:**
- Modify: `src/generators/index.ts`

**Step 1: Create generator**

```typescript
import PptxGenJS from 'pptxgenjs';
import type { Presentation, Slide, SlideContent, Template } from '../index.js';

export class PPTXGenerator {
  private pptx: PptxGenJS;
  private template: Template;

  constructor(template: Template) {
    this.template = template;
    this.pptx = new PptxGenJS();
    this.setupPresentation();
  }

  private setupPresentation(): void {
    this.pptx.layout = 'LAYOUT_16x9';
    this.pptx.author = 'pptx-cli';
    this.pptx.title = 'Presentation';
  }

  async generate(presentation: Presentation): Promise<Buffer> {
    // Set metadata
    if (presentation.meta.title) {
      this.pptx.title = presentation.meta.title;
    }
    if (presentation.meta.author) {
      this.pptx.author = presentation.meta.author;
    }

    // Generate slides
    for (const slide of presentation.slides) {
      await this.generateSlide(slide);
    }

    // Write to buffer
    const buffer = await this.pptx.write({ outputType: 'nodebuffer' });
    return buffer as Buffer;
  }

  private async generateSlide(slide: Slide): Promise<void> {
    const pptxSlide = this.pptx.addSlide();
    
    // Set background
    pptxSlide.background = { color: this.template.colors.background.slice(1) };

    // Add title
    if (slide.title) {
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: this.template.fonts.title.size,
        fontFace: this.template.fonts.title.name,
        bold: this.template.fonts.title.bold,
        color: this.template.colors.text.slice(1),
      });
    }

    // Add content
    let y = 1.5;
    for (const content of slide.contents) {
      y = await this.addContent(pptxSlide, content, y);
    }
  }

  private async addContent(
    slide: PptxGenJS.default,
    content: SlideContent,
    startY: number
  ): Promise<number> {
    switch (content.type) {
      case 'text':
        slide.addText(content.text, {
          x: 0.5,
          y: startY,
          w: 9,
          fontSize: this.template.fonts.body.size,
          fontFace: this.template.fonts.body.name,
          color: this.template.colors.text.slice(1),
        });
        return startY + 0.5;

      case 'list':
        slide.addText(
          content.items.map((item) => ({ text: item, options: { bullet: true } })),
          {
            x: 0.5,
            y: startY,
            w: 9,
            fontSize: this.template.fonts.body.size,
            fontFace: this.template.fonts.body.name,
            color: this.template.colors.text.slice(1),
          }
        );
        return startY + 0.5 * content.items.length;

      case 'image':
        slide.addImage({
          path: content.src,
          x: 1,
          y: startY,
          w: 4,
          h: 3,
        });
        return startY + 3.5;

      default:
        return startY;
    }
  }
}

export const createGenerator = (template: Template) => new PPTXGenerator(template);
```

**Step 2: Commit**

```bash
git add src/generators/index.ts
git commit -m "feat: implement PPTX generator"
```

---

## Phase 6: Integration

### Task 12: Wire up CLI with parser and generator

**Files:**
- Modify: `src/cli/index.ts`

**Step 1: Update CLI to use parser and generator**

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { readFile, writeFile } from 'fs/promises';
import { parser } from '../parser/index.js';
import { templateLoader } from '../templates/index.js';
import { createGenerator } from '../generators/index.js';

const program = new Command();

program
  .name('pptx-cli')
  .description('Convert Markdown to PowerPoint presentations')
  .version('0.1.0');

program
  .command('generate <input>')
  .description('Generate PPTX from Markdown file')
  .option('-o, --output <file>', 'Output file name', 'output.pptx')
  .option('-t, --template <name>', 'Template name', 'default')
  .option('-w, --watch', 'Watch for changes', false)
  .action(async (input: string, options: { output: string; template: string; watch: boolean }) => {
    try {
      console.log(`Reading ${input}...`);
      const markdown = await readFile(input, 'utf-8');
      
      console.log('Parsing Markdown...');
      const presentation = await parser.parse(markdown);
      
      console.log(`Loading template: ${options.template}...`);
      const template = await templateLoader.get(options.template);
      if (!template) {
        console.error(`Template "${options.template}" not found`);
        process.exit(1);
      }
      
      console.log('Generating PPTX...');
      const generator = createGenerator(template);
      const buffer = await generator.generate(presentation);
      
      console.log(`Writing to ${options.output}...`);
      await writeFile(options.output, buffer);
      
      console.log('✅ Done!');
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program
  .command('init [name]')
  .description('Initialize a new presentation project')
  .action(async (name: string = 'my-presentation') => {
    console.log(`Initializing ${name}...`);
    // TODO: Implement init
  });

program.parse();
```

**Step 2: Commit**

```bash
git add src/cli/index.ts
git commit -m "feat: wire up CLI with parser and generator"
```

---

### Task 13: Create example Markdown file

**Files:**
- Create: `examples/demo.md`

**Step 1: Create example**

```markdown
---
theme: default
title: pptx-cli Demo
author: pptx-cli
---

## Welcome to pptx-cli

A powerful CLI tool that converts Markdown to PowerPoint presentations.

---

## Features

- Simple Markdown syntax
- Multiple templates
- Easy to customize
- Fast and efficient

---

## Getting Started

1. Install pptx-cli
2. Write your slides in Markdown
3. Run pptx-cli generate
4. Share your presentation!

---

## Thank You

Questions?
```

**Step 2: Commit**

```bash
git add examples/
git commit -m "docs: add example Markdown file"
```

---

### Task 14: Create README

**Files:**
- Create: `README.md`

**Step 1: Create README**

```markdown
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
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Phase 7: Finalize

### Task 15: Build and test

**Step 1: Build the project**

```bash
npm run build
```

**Step 2: Test with example**

```bash
node dist/cli/index.js generate examples/demo.md -o test-output.pptx
```

Expected: Creates test-output.pptx file

**Step 3: Final commit**

```bash
git add .
git commit -m "chore: finalize MVP"
```

---

## Next Steps (Post-MVP)

1. Add React components for complex layouts
2. Add chart support
3. Add table support
4. Add code highlighting
5. Add watch mode
6. Add init command
7. Add animation support
8. Add more templates
9. Add tests
10. Publish to npm
