import showdown from 'showdown';
import yaml from 'yaml-js';
import settings from '../settings';

class MarkdownImporter {
  constructor() {
    this.converter = new showdown.Converter({
      metadata: true,
    });
  }

  importFile(markDown) {
    const articleContent = this.converter.makeHtml(markDown);
    const rawMetadata = this.converter.getMetadata(true);
    const metadata = yaml.load(rawMetadata);

    this.fillMetadatas(metadata);

    const data = markDown.replace(rawMetadata, yaml.dump(metadata));
    return {metadata, data};
  }

  fillMetadatas(metadata) {
    if (typeof metadata.pubDate === 'undefined' || !metadata.pubDate) {
      const date = new Date();
      metadata.pubDate = date.toGMTString();
    }
    if (typeof metadata.author === 'undefined' || !metadata.author) {
      metadata.author = settings.defaultAuthor;
    }
  }
}

export default MarkdownImporter;