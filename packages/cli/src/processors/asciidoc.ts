// Limitations:
// - variables are not replaced

import Asciidoctor from '@asciidoctor/core';
import { decode } from 'html-entities';

import RawConverter from './asciidoc/rawconverter';

// TODO: evaluate understanding of simple markdown to remove HTML overhead
export default class AsciiDocProcessor implements Processor {
  private asciiDoctor;

  constructor() {
    this.asciiDoctor = Asciidoctor();
    this.asciiDoctor.ConverterFactory.register(new RawConverter(), ['html5']);
  }

  public async process(filePath: string): Promise<Page> {
    const blocks = [];
    const doc = this.asciiDoctor.loadFile(filePath, { safe: 'safe' });
    const pageTitle = decode(doc.getTitle());
    const overview = doc.getContent();
    for (const section of doc.getSections()) {
      blocks.push({
        title: decode(section.getTitle()),
        text: section.getContent(),
      });
      for (const subSection of section.getSections()) {
        blocks.push({
          title: decode(subSection.getTitle()),
          text: subSection.getContent(),
        });
      }
    }
    return {
      title: pageTitle,
      overview,
      blocks,
    };
  }
}
