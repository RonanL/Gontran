import fs from 'fs';
import showdown from 'showdown';
import dot from 'dot';
import yaml from 'yaml-js';
import HtmlExporter from './exporter/html';
import MarkdownImporter from './importer/markdown';
import settings from './settings';

const htmlExporter = new HtmlExporter();
const markdownImporter = new MarkdownImporter();

const processAll = () => {
  processNewFiles(settings.sourceFolder).then(() => {
    exportSite();
  });
}

const processNewFiles = (sourceFolder) => {
  return new Promise((resolve, reject) => {
    fs.readdir(sourceFolder, (err, files) => {
      if (err) {
        reject(err);
      }

      const result = files.filter(file => file.endsWith('.md')).map((file) => {
        return processNewFile(file, sourceFolder);
      });
      
      Promise.all(result).then(resolve).catch(reject);
    });
  });
}

function processNewFile(filename, sourceFolder) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${sourceFolder}/${filename}`, 'utf8', (err, markdown) => {
      fs.rename(`${sourceFolder}/${filename}`, `${settings.archiveFolder}/${filename}`, (err) => {/* Maybe do something here */});
      const article = markdownImporter.importFile(markdown);
      const pubDate = new Date(article.metadata.pubDate);
      const newFilename = `${pubDate.getFullYear()}-${pubDate.getMonth()}-${pubDate.getDate()}-${pubDate.getHours()}-${pubDate.getMinutes()}-${filename}`;
      fs.writeFile(`${settings.dataFolder}/${newFilename}`, article.data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(article);
        }
      });
    });
  });
};

const exportSite = () => {
  // Remove existing files
  removeFiles(settings.exportFolder).then(() => {
    fs.readdir(settings.dataFolder, (err, files) => {
      const result = files.filter(file => file.endsWith('.md')).map((file) => {
        return exportFile(file);
      });
      // Export article pages
      Promise.all(result).then((articles) => {
        // Export home page
        exportHomePage(articles);
      });
    });
  });
}

const exportFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${settings.dataFolder}/${filename}`, 'utf8', (err, markdown) => {
      const article = htmlExporter.exportArticle(markdown);
      article.filename = filename.replace('md', 'html');
      fs.writeFile(`${settings.exportFolder}/${filename.replace('md', 'html')}`, article.html, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(article);
        }
      });
    });
  });
};

const exportHomePage = (articles) => {
  const page = htmlExporter.exportHomepage(articles);

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

const removeFiles = (folder) => {
  return new Promise((resolve, reject) => {
    const files = fs.readdir(folder, (err, files) => {
      Promise.all(files.filter(file => file !== '.keep').map((file) => {
        removeFile(`${folder}/${file}`);
      })).then(() => {
        resolve();
      });
    });
  });
}

const removeFile = (filepath) => {
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

processAll();
