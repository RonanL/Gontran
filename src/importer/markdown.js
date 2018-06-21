import fs from 'fs';
import showdown from 'showdown';
import yaml from 'yaml-js';
import settings from '../settings';

class MarkdownImporter {
  constructor() {
    this.converter = new showdown.Converter({
      metadata: true,
    });
  }

  importFile(filename, sourceFolder) {
    return new Promise((resolve, reject) => {
      fs.readFile(`${sourceFolder}/${filename}`, 'utf8', (err, markdown) => {
        fs.rename(`${sourceFolder}/${filename}`, `${settings.archiveFolder}/${filename}`, (err) => {/* Maybe do something here */});
        const article = this.processMarkdown(markdown);
        const pubDate = new Date(article.metadata.pubDate);
        const newFilename = `${pubDate.getFullYear()}-${`0${pubDate.getMonth()+1}`.slice(-2)}-${`0${pubDate.getDate()}`.slice(-2)}-${`0${pubDate.getHours()}`.slice(-2)}-${`0${pubDate.getMinutes()}`.slice(-2)}-${filename}`;
        fs.writeFile(`${settings.dataFolder}/${newFilename}`, article.data, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(article);
          }
        });
      });
    });
  }

  processMarkdown(markDown) {
    let data;

    // We don’t use the html, but we must process the markdown in order to access the metadata.
    this.converter.makeHtml(markDown);
    const rawMetadata = this.converter.getMetadata(true);
    let metadata = yaml.load(rawMetadata);

    if (metadata !== null) {
      this.fillMetadata(metadata, markDown);

      data = markDown.replace(rawMetadata, yaml.dump(metadata));
    } else {
      metadata = {};
      this.fillMetadata(metadata, markDown);

      data = `---\n${yaml.dump(metadata)}---\n${markDown}`;
    }

    return {metadata, data};
  }

  fillMetadata(metadata, markDown) {
    if (typeof metadata.pubDate === 'undefined' || !metadata.pubDate) {
      const date = new Date();
      metadata.pubDate = date.toGMTString();
    }
    if (typeof metadata.author === 'undefined' || !metadata.author) {
      metadata.author = settings.defaultAuthor;
    }
    if (typeof metadata.title === 'undefined' || !metadata.title) {
      const titleMatch = markDown.match(/# (.*)/);
      if (titleMatch !== null) {
        metadata.title = titleMatch[1];
      } else {
        metadata.title = null;
      }
    }
  }
}

export default MarkdownImporter;