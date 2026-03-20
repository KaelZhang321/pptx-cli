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
    console.log('TODO: Implement init command');
  });

program.parse();
