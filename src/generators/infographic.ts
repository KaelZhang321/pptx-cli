import { writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { InfographicContent } from '../parser/ast.js';

const createRequire = (await import('node:module')).createRequire;
const require = createRequire(import.meta.url);

export interface InfographicRenderResult {
  svg: string;
  imagePath?: string;
  width: number;
  height: number;
}

export class InfographicGenerator {
  private tempDir: string;
  private renderToString: (syntax: string, options?: Record<string, unknown>) => Promise<string>;

  constructor() {
    this.tempDir = join(tmpdir(), 'pptx-cli-infographic');
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
    
    const ssrModule = require('@antv/infographic/ssr');
    this.renderToString = ssrModule.renderToString;
  }

  async render(content: InfographicContent): Promise<InfographicRenderResult> {
    const options: Record<string, unknown> = {};
    if (content.theme) options.theme = content.theme;
    if (content.width) options.width = content.width;
    if (content.height) options.height = content.height;
    
    const svg = await this.renderToString(content.syntax, options);
    
    const width = content.width || 800;
    const height = content.height || 600;
    
    const imagePath = await this.svgToImage(svg, width, height);
    
    return {
      svg,
      imagePath,
      width,
      height,
    };
  }

  private async svgToImage(svg: string, width: number, height: number): Promise<string> {
    const sharp = require('sharp');
    
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const outputPath = join(this.tempDir, `infographic-${timestamp}-${randomSuffix}.png`);
    
    const svgBuffer = Buffer.from(svg);
    
    await sharp(svgBuffer)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toFile(outputPath);
    
    return outputPath;
  }

  cleanup(): void {
    if (existsSync(this.tempDir)) {
      const files = readdirSync(this.tempDir);
      for (const file of files) {
        if (file.startsWith('infographic-')) {
          try {
            unlinkSync(join(this.tempDir, file));
          } catch {}
        }
      }
    }
  }
}

export const infographicGenerator = new InfographicGenerator();
