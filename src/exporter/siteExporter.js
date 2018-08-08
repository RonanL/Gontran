import fs from 'fs';
import settings from '../settings';
import Converter from '../converter/md2html';

class SiteExporter {
  constructor() {
    this.converter = new Converter();
  }

  exportSite() {
    // Remove existing files
    return this.removeFiles(settings.exportFolder).then(() => {
      fs.readdir(settings.dataFolder, (err, files) => {
        const result = files.filter(file => file.endsWith('.md')).map((file) => {
          return this.exportFile(file);
        });
        // Export article pages
        Promise.all(result).then((articles) => {
          // Export home page
          this.exportHomePage(articles);
        });
      });
    });
  }

  exportFile(filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(`${settings.dataFolder}/${filename}`, 'utf8', (err, markdown) => {
        const article = this.converter.exportArticle(markdown);
        article.filename = `${article.metadata.filename}.html`;
        fs.writeFile(`${settings.exportFolder}/${article.filename}`, article.html, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(article);
          }
        });
      });
    });
  };

  exportHomePage(articles) {
    const page = this.converter.exportHomepage(articles);

    return new Promise((resolve, reject) => {
      fs.writeFile(`${settings.exportFolder}/index.html`, page.html, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  removeFiles(folder) {
    return new Promise((resolve, reject) => {
      const files = fs.readdir(folder, (err, files) => {
        Promise.all(files.filter(file => file !== '.keep').map((file) => {
          this.removeFile(`${folder}/${file}`);
        })).then(() => {
          resolve();
        });
      });
    });
  }

  removeFile(filepath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filepath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default SiteExporter;