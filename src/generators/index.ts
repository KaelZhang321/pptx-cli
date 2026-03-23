import { createRequire } from 'node:module';
import type { Presentation, Slide, SlideContent, SlideType } from '../parser/ast.js';
import type { Template } from '../templates/index.js';
import { InfographicGenerator } from './infographic.js';

const require = createRequire(import.meta.url);

export class PPTXGenerator {
  private pptx: any;
  private template: Template;
  private infographicGenerator: InfographicGenerator;

  constructor(template: Template) {
    this.template = template;
    const PptxGenJS = require('pptxgenjs');
    this.pptx = new PptxGenJS();
    this.infographicGenerator = new InfographicGenerator();
    this.setupPresentation();
  }

  private setupPresentation(): void {
    this.pptx.layout = 'LAYOUT_16x9';
    this.pptx.author = 'pptx-cli';
    this.pptx.title = 'Presentation';
  }

  async generate(presentation: Presentation): Promise<Buffer> {
    if (presentation.meta.title) {
      this.pptx.title = presentation.meta.title;
    }
    if (presentation.meta.author) {
      this.pptx.author = presentation.meta.author;
    }

    for (const slide of presentation.slides) {
      await this.generateSlide(slide);
    }

    const buffer = await this.pptx.write({ outputType: 'nodebuffer' });
    this.infographicGenerator.cleanup();
    return buffer as Buffer;
  }

  private async generateSlide(slide: Slide): Promise<void> {
    const slideType = slide.type || 'content';
    
    switch (slideType) {
      case 'cover':
        this.generateCoverSlide(slide);
        break;
      case 'section':
        this.generateSectionSlide(slide);
        break;
      default:
        await this.generateContentSlide(slide);
    }
  }

  private generateCoverSlide(slide: Slide): void {
    const pptxSlide = this.pptx.addSlide();
    const colors = this.template.colors as any;
    
    pptxSlide.background = { color: (colors.primary || '#2B6CB0').slice(1) };
    
    const cardWidth = 7.5;
    const cardHeight = 3.8;
    const cardX = (10 - cardWidth) / 2;
    const cardY = (5.625 - cardHeight) / 2;
    
    pptxSlide.addShape('rect', {
      x: cardX,
      y: cardY,
      w: cardWidth,
      h: cardHeight,
      fill: { color: 'FFFFFF', transparency: 10 },
      line: { color: 'FFFFFF', width: 0 },
    });
    
    pptxSlide.addShape('rect', {
      x: cardX,
      y: cardY,
      w: cardWidth,
      h: 0.03,
      fill: { color: (colors.primary || '#2B6CB0').slice(1) },
      line: { width: 0 },
    });
    
    pptxSlide.addShape('rect', {
      x: cardX,
      y: cardY + cardHeight - 0.03,
      w: cardWidth,
      h: 0.03,
      fill: { color: (colors.primary || '#2B6CB0').slice(1) },
      line: { width: 0 },
    });
    
    if (slide.title) {
      pptxSlide.addText(slide.title, {
        x: cardX + 0.3,
        y: cardY + 0.5,
        w: cardWidth - 0.6,
        h: 0.8,
        fontSize: 32,
        fontFace: 'Microsoft YaHei',
        bold: true,
        color: (colors.text || '#1A2B4C').slice(1),
        align: 'center',
      });
    }
    
    if (slide.subtitle) {
      pptxSlide.addText(slide.subtitle, {
        x: cardX + 0.3,
        y: cardY + 1.4,
        w: cardWidth - 0.6,
        h: 0.4,
        fontSize: 18,
        fontFace: 'Microsoft YaHei',
        color: (colors.primary || '#2B6CB0').slice(1),
        align: 'center',
      });
    }
    
    if (slide.meta) {
      let infoY = cardY + 2.2;
      
      if (slide.meta.author) {
        pptxSlide.addText(`汇报团队：${slide.meta.author}`, {
          x: cardX + 1.5,
          y: infoY,
          w: 2,
          h: 0.3,
          fontSize: 11,
          fontFace: 'Microsoft YaHei',
          color: (colors.secondary || '#4A5568').slice(1),
          align: 'center',
        });
      }
      
      if (slide.meta.date) {
        pptxSlide.addText(`汇报日期：${slide.meta.date}`, {
          x: cardX + 4,
          y: infoY,
          w: 2,
          h: 0.3,
          fontSize: 11,
          fontFace: 'Microsoft YaHei',
          color: (colors.secondary || '#4A5568').slice(1),
          align: 'center',
        });
      }
    }
    
    if (slide.meta?.highlight) {
      const hlWidth = 4.5;
      const hlX = (10 - hlWidth) / 2;
      const hlY = cardY + cardHeight - 0.8;
      
      pptxSlide.addShape('rect', {
        x: hlX,
        y: hlY,
        w: hlWidth,
        h: 0.5,
        fill: { color: (colors.background || '#F7FAFC').slice(1) },
        line: { width: 0 },
      });
      
      pptxSlide.addShape('rect', {
        x: hlX,
        y: hlY,
        w: 0.03,
        h: 0.5,
        fill: { color: (colors.primary || '#2B6CB0').slice(1) },
        line: { width: 0 },
      });
      
      pptxSlide.addText(slide.meta.highlight, {
        x: hlX + 0.15,
        y: hlY,
        w: hlWidth - 0.2,
        h: 0.5,
        fontSize: 11,
        fontFace: 'Microsoft YaHei',
        bold: true,
        color: (colors.text || '#1A2B4C').slice(1),
        align: 'center',
        valign: 'middle',
      });
    }
  }

  private generateSectionSlide(slide: Slide): void {
    const pptxSlide = this.pptx.addSlide();
    const colors = this.template.colors as any;
    
    pptxSlide.background = { color: (colors.background || '#F7FAFC').slice(1) };
    
    pptxSlide.addShape('rect', {
      x: 0,
      y: 2.3,
      w: 10,
      h: 1,
      fill: { color: (colors.primary || '#2B6CB0').slice(1) },
      line: { width: 0 },
    });
    
    if (slide.title) {
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 2.4,
        w: 9,
        h: 0.8,
        fontSize: 28,
        fontFace: 'Microsoft YaHei',
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
      });
    }
    
    if (slide.subtitle) {
      pptxSlide.addText(slide.subtitle, {
        x: 0.5,
        y: 3.5,
        w: 9,
        h: 0.5,
        fontSize: 14,
        fontFace: 'Microsoft YaHei',
        color: (colors.secondary || '#4A5568').slice(1),
        align: 'center',
      });
    }
  }

  private async generateContentSlide(slide: Slide): Promise<void> {
    const pptxSlide = this.pptx.addSlide();
    const colors = this.template.colors as any;
    
    pptxSlide.background = { color: (colors.background || '#F7FAFC').slice(1) };
    
    pptxSlide.addShape('rect', {
      x: 0,
      y: 0,
      w: 10,
      h: 0.08,
      fill: { color: (colors.primary || '#2B6CB0').slice(1) },
      line: { width: 0 },
    });
    
    if (slide.title) {
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.6,
        fontSize: 24,
        fontFace: 'Microsoft YaHei',
        bold: true,
        color: (colors.text || '#1A2B4C').slice(1),
      });
      
      pptxSlide.addShape('rect', {
        x: 0.5,
        y: 0.95,
        w: 1.5,
        h: 0.03,
        fill: { color: (colors.primary || '#2B6CB0').slice(1) },
        line: { width: 0 },
      });
    }
    
    let y = 1.3;
    for (const content of slide.contents) {
      y = await this.addContent(pptxSlide, content, y);
    }
  }

  private async addContent(
    pptxSlide: any,
    content: SlideContent,
    startY: number
  ): Promise<number> {
    const colors = this.template.colors as any;
    
    switch (content.type) {
      case 'text':
        pptxSlide.addText(content.text, {
          x: 0.5,
          y: startY,
          w: 9,
          fontSize: this.template.fonts.body.size,
          fontFace: this.template.fonts.body.name,
          color: (colors.text || '#1A2B4C').slice(1),
        });
        return startY + 0.5;

      case 'list':
        pptxSlide.addText(
          content.items.map((item: string) => ({
            text: item,
            options: { bullet: true },
          })),
          {
            x: 0.5,
            y: startY,
            w: 9,
            fontSize: this.template.fonts.body.size,
            fontFace: this.template.fonts.body.name,
            color: (colors.text || '#1A2B4C').slice(1),
          }
        );
        return startY + 0.4 * content.items.length;

      case 'image':
        pptxSlide.addImage({
          path: content.src,
          x: 1,
          y: startY,
          w: 4,
          h: 3,
        });
        return startY + 3.5;

      case 'infographic':
        try {
          const result = await this.infographicGenerator.render(content);
          const scale = Math.min(8 / result.width, 4 / result.height);
          const displayWidth = result.width * scale;
          const displayHeight = result.height * scale;
          const x = (10 - displayWidth) / 2;
          
          pptxSlide.addImage({
            path: result.imagePath,
            x: x,
            y: startY,
            w: displayWidth,
            h: displayHeight,
          });
          return startY + displayHeight + 0.3;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          pptxSlide.addText(`[Infographic Error: ${errorMsg}]`, {
            x: 0.5,
            y: startY,
            w: 9,
            fontSize: 12,
            fontFace: 'Microsoft YaHei',
            color: 'FF0000',
          });
          return startY + 0.5;
        }

      default:
        return startY;
    }
  }
}

export const createGenerator = (template: Template) => new PPTXGenerator(template);
