import { createRequire } from 'node:module';
import type { Presentation, Slide, SlideContent } from '../parser/ast.js';
import type { Template } from '../templates/index.js';

const require = createRequire(import.meta.url);

export class PPTXGenerator {
  private pptx: any;
  private template: Template;

  constructor(template: Template) {
    this.template = template;
    const PptxGenJS = require('pptxgenjs');
    this.pptx = new PptxGenJS();
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
    return buffer as Buffer;
  }

  private async generateSlide(slide: Slide): Promise<void> {
    const pptxSlide = this.pptx.addSlide();
    
    pptxSlide.background = { color: this.template.colors.background.slice(1) };

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

    let y = 1.5;
    for (const content of slide.contents) {
      y = await this.addContent(pptxSlide, content, y);
    }
  }

  private async addContent(
    pptxSlide: any,
    content: SlideContent,
    startY: number
  ): Promise<number> {
    switch (content.type) {
      case 'text':
        pptxSlide.addText(content.text, {
          x: 0.5,
          y: startY,
          w: 9,
          fontSize: this.template.fonts.body.size,
          fontFace: this.template.fonts.body.name,
          color: this.template.colors.text.slice(1),
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
            color: this.template.colors.text.slice(1),
          }
        );
        return startY + 0.5 * content.items.length;

      case 'image':
        pptxSlide.addImage({
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
