import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
    [key: string]: string | undefined;
  };
  fonts: {
    title: { name: string; size: number; bold?: boolean };
    subtitle: { name: string; size: number };
    body: { name: string; size: number };
  };
  layouts: {
    title: Record<string, unknown>;
    content: Record<string, unknown>;
    cover?: Record<string, unknown>;
    section?: Record<string, unknown>;
    twoColumn?: Record<string, unknown>;
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
