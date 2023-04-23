/**
 * POC converter to transform asciidoc into markdownish raw text.
 *
 * Full list of elements at https://docs.asciidoctor.org/asciidoctor.js/latest/extend/converter/custom-converter/ .
 */
import { decode } from 'html-entities';

import Logger from '../../logger';

export default class RawConverter {
  convert(node, transform) {
    const nodeName = transform || node.getNodeName();
    let output = '';
    switch (nodeName) {
      case 'preamble':
        output += `${node.getContent()}\n\n`;
        break;
      case 'inline_break':
      case 'thematic_break':
        output += '\n\n';
        break;
      case 'paragraph':
        output += `${node.getContent()}\n\n`;
        break;
      case 'listing':
        // TODO: language could be undefined?
        output += `\n\n\`\`\`${node.getAttribute('language')}\n${node.getContent()}\n\`\`\`\n\n`;
        break;
      case 'literal':
      case 'example':
        output += `\n\n\`\`\\n${node.getContent()}\n\`\`\`\n\n`;
        break;
      case 'admonition':
        output += `\n\n${node.getContent()}\n\n`;
        break;
      case 'sidebar':
      case 'inline_callout':
        break;
      case 'table':
        // TODO
        break;
      case 'dlist':
        output += node.getItems().reduce((acc, item) => {
          const definitionTerm = item[0][0].getText();
          const definition = `${item[1].getText()}${item[1].getContent()}`;
          acc += `${definitionTerm}: ${definition}\n`;
          return acc;
        }, '');
        break;
      case 'olist':
      case 'colist':
      case 'ulist':
        output += node.getItems().reduce((acc, item, index) => {
          acc += `${index + 1}) ${item.getText()}${item.getContent()}\n`;
          return acc;
        }, '');
        break;
      case 'inline_quoted':
      case 'inline_anchor':
        output += `"${node.getText()}"`;
        break;
      case 'section':
        if (node.getLevel() === 3) {
          output += `\n\n${decode(node.getTitle())}\n\n${node.getContent()}\n\n`;
        } else {
          return '';
        }
        break;
      case 'inline_image':
      case 'image':
        break;
      default:
        Logger.getInstance().debug(`Ignoring asciidoc node with name "${nodeName}"`);
        return '';
    }
    return decode(output);
  }
}
