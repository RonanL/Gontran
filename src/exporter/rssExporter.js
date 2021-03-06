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
          const article = this.converter.convertArticle(markdown);
          const date = new Date(article.metadata.guid);
          const dateString = `${date.getFullYear()}-${`0${date.getMonth()+1}`.slice(-2)}-${`0${date.getDate()}`.slice(-2)}`
          const filename = `${dateString}_${article.metadata.identifier}.html`;

          article.url = `${settings.baseURL}/${filename}`;
          resolve(this.dots.item(article));
        }
      });
    });
  };

  exportFeed(items) {
    const date = new Date();
    const feed = {
      siteName: settings.siteName,
      baseURL: settings.baseURL,
      buildDate: date.toGMTString(),
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