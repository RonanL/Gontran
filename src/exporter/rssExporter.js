import fs from 'fs';
import settings from '../settings';
import Converter from '../converter/md2html';
import dot from 'dot';

class RssExporter {
  constructor() {
    this.converter = new Converter();

    this.dots = dot.process({ path: "./views/rss"});
  }

  export() {
    fs.readdir(settings.dataFolder, (err, files) => {
      const result = files.filter(file => file.endsWith('.md')).map((file) => {
        return this.parseFile(file);
      });
      // Export article pages
      Promise.all(result).then((items) => {
        // Export home page
        this.exportFeed(items);
      });
    });
  }

  parseFile(filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(`${settings.dataFolder}/${filename}`, 'utf8', (err, markdown) => {
        if (err) {
          reject(err);
        } else {
          const article = this.converter.exportArticle(markdown);
          article.filename = filename.replace('md', 'html');
          resolve(this.dots.item(article));
        }
      });
    });
  };

  exportFeed(items) {
    const feed = {
      items,
    };
    
    const xmlFeed = this.dots.feed(feed);

    return new Promise((resolve, reject) => {
      fs.writeFile(`${settings.exportFolder}/feed.rss`, xmlFeed, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default RssExporter;