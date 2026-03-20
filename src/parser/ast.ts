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
