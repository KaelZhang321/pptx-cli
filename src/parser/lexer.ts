import yaml from 'yaml';
import type { Presentation, Slide, SlideContent, SlideMeta, SlideType, InfographicContent } from './ast.js';

export class MarkdownParser {
  private slideIndex = 0;

  async parse(markdown: string): Promise<Presentation> {
    this.slideIndex = 0;
    const sections = this.splitSlides(markdown);
    const { meta, content } = this.parseFrontmatter(sections[0]);
    
    const slides: Slide[] = [];
    
    if (content.trim()) {
      for (const section of sections) {
        const slide = this.parseSlide(section);
        slides.push(slide);
        this.slideIndex++;
      }
    }
    
    return { meta, slides };
  }

  private splitSlides(markdown: string): string[] {
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

  private detectSlideType(title: string, contents: SlideContent[], isFirstSlide: boolean): SlideType {
    if (isFirstSlide && title) {
      return 'cover';
    }
    
    const hasH1 = title && !title.startsWith('##');
    const contentCount = contents.filter(c => c.type !== 'text' || c.text.trim()).length;
    if (hasH1 && contentCount <= 2) {
      return 'section';
    }
    
    return 'content';
  }

  private parseSlide(markdown: string): Slide {
    const codeBlocks = this.extractCodeBlocks(markdown);
    let processedMarkdown = this.removeCodeBlocks(markdown);
    
    const lines = processedMarkdown.trim().split('\n');
    let title = '';
    let subtitle = '';
    let template: string | undefined;
    const contents: SlideContent[] = [];
    const meta: { author?: string; date?: string; highlight?: string } = {};

    for (const line of lines) {
      const templateMatch = line.match(/<!--\s*template:\s*(\w+)\s*-->/);
      if (templateMatch) {
        template = templateMatch[1];
        continue;
      }

      const typeMatch = line.match(/<!--\s*type:\s*(\w+)\s*-->/);
      if (typeMatch) {
        continue;
      }

      const authorMatch = line.match(/<!--\s*author:\s*(.+)\s*-->/);
      if (authorMatch) {
        meta.author = authorMatch[1];
        continue;
      }
      const dateMatch = line.match(/<!--\s*date:\s*(.+)\s*-->/);
      if (dateMatch) {
        meta.date = dateMatch[1];
        continue;
      }
      const highlightMatch = line.match(/<!--\s*highlight:\s*(.+)\s*-->/);
      if (highlightMatch) {
        meta.highlight = highlightMatch[1];
        continue;
      }

      const h2Match = line.match(/^##\s+(.+)$/);
      if (h2Match) {
        title = h2Match[1];
        continue;
      }

      const h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match && !title) {
        title = h1Match[1];
        continue;
      }

      const h3Match = line.match(/^###\s+(.+)$/);
      if (h3Match) {
        subtitle = h3Match[1];
        continue;
      }

      if (!line.trim()) continue;

      contents.push(this.parseLine(line));
    }

    for (const block of codeBlocks) {
      if (block.language === 'infographic' || block.language === 'ifgc') {
        contents.push(this.parseInfographicBlock(block));
      } else if (block.language) {
        contents.push({ type: 'code', language: block.language, code: block.code });
      }
    }

    const consolidatedContents = this.consolidateLists(contents);
    
    const type = this.detectSlideType(title, consolidatedContents, this.slideIndex === 0);

    const slide: Slide = { title, contents: consolidatedContents, type };
    if (subtitle) slide.subtitle = subtitle;
    if (template) slide.template = template;
    if (Object.keys(meta).length > 0) slide.meta = meta;

    return slide;
  }

  private extractCodeBlocks(markdown: string): Array<{ language: string; code: string; meta?: string }> {
    const blocks: Array<{ language: string; code: string; meta?: string }> = [];
    const regex = /```(\w+)?(?:\s+([^\n]*))?\n([\s\S]*?)```/g;
    
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      blocks.push({
        language: match[1] || '',
        meta: match[2],
        code: match[3].trim(),
      });
    }
    
    return blocks;
  }

  private removeCodeBlocks(markdown: string): string {
    return markdown.replace(/```(\w+)?(?:\s+[^\n]*)?\n[\s\S]*?```/g, '');
  }

  private parseInfographicBlock(block: { code: string; meta?: string }): InfographicContent {
    const content: InfographicContent = {
      type: 'infographic',
      syntax: block.code,
    };
    
    if (block.meta) {
      const metaParts = block.meta.split(/\s+/);
      for (const part of metaParts) {
        const [key, value] = part.split('=');
        if (key === 'theme') content.theme = value;
        if (key === 'template') content.template = value;
        if (key === 'width') content.width = parseInt(value, 10);
        if (key === 'height') content.height = parseInt(value, 10);
      }
    }
    
    return content;
  }

  private consolidateLists(contents: SlideContent[]): SlideContent[] {
    const result: SlideContent[] = [];
    let currentList: string[] = [];

    for (const content of contents) {
      if (content.type === 'list') {
        currentList.push(...content.items);
      } else {
        if (currentList.length > 0) {
          result.push({ type: 'list', items: currentList, ordered: false });
          currentList = [];
        }
        result.push(content);
      }
    }

    if (currentList.length > 0) {
      result.push({ type: 'list', items: currentList, ordered: false });
    }

    return result;
  }

  private parseLine(line: string): SlideContent {
    const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      return { type: 'image', alt: imgMatch[1], src: imgMatch[2] };
    }

    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      return { type: 'list', items: [listMatch[1]], ordered: false };
    }

    return { type: 'text', text: line };
  }
}

export const parser = new MarkdownParser();
