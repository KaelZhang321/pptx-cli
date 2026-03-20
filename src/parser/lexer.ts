import yaml from 'yaml';
import type { Presentation, Slide, SlideContent, SlideMeta } from './ast.js';

export class MarkdownParser {
  async parse(markdown: string): Promise<Presentation> {
    const sections = this.splitSlides(markdown);
    const { meta, content } = this.parseFrontmatter(sections[0]);
    
    const slides: Slide[] = [];
    
    if (content.trim()) {
      for (const section of sections) {
        const slide = this.parseSlide(section);
        slides.push(slide);
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

  private parseSlide(markdown: string): Slide {
    const lines = markdown.trim().split('\n');
    let title = '';
    let template: string | undefined;
    const contents: SlideContent[] = [];

    for (const line of lines) {
      const templateMatch = line.match(/<!--\s*template:\s*(\w+)\s*-->/);
      if (templateMatch) {
        template = templateMatch[1];
        continue;
      }

      const titleMatch = line.match(/^##\s+(.+)$/);
      if (titleMatch) {
        title = titleMatch[1];
        continue;
      }

      const h1Match = line.match(/^#\s+(.+)$/);
      if (h1Match && !title) {
        title = h1Match[1];
        continue;
      }

      if (!line.trim()) continue;

      contents.push(this.parseLine(line));
    }

    return { title, template, contents };
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
