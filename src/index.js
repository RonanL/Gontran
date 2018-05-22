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
  processNewFiles(settings.sourceFolder);

  exportSite();
}

const processNewFiles = (sourceFolder) => {
  const files = fs.readdirSync(sourceFolder);
  files.map((file) => {
    if (file.endsWith('.md')) {
      processNewFile(file, sourceFolder);
    }
    return file;
  });
}

function processNewFile(filename, sourceFolder) {
  const markdown = fs.readFileSync(`${sourceFolder}/${filename}`, 'utf8');
  fs.renameSync(`${sourceFolder}/${filename}`, `${settings.archiveFolder}/${filename}`);
  const article = markdownImporter.importFile(markdown);
  const pubDate = new Date(article.metadata.pubDate);
  const newFilename = `${pubDate.getFullYear()}-${pubDate.getMonth()}-${pubDate.getDate()}-${pubDate.getHours()}-${pubDate.getMinutes()}-${filename}`;
  fs.writeFileSync(`${settings.dataFolder}/${newFilename}`, article.data);
};

const exportSite = () => {
  // Remove existing files
  removeFiles(settings.exportFolder);

  fs.readdir(settings.dataFolder, (err, files) => {
    // Export article pages
    const articles = files.map((file) => {
      if (file.endsWith('.md')) {
        return exportFile(file);
      }
    }).filter(article => typeof article !== 'undefined');

    // Export home page
    exportHomePage(articles);
  });
}

const exportFile = (filename) => {
  const markdown = fs.readFileSync(`${settings.dataFolder}/${filename}`, 'utf8');
  const article = htmlExporter.exportArticle(markdown);
  article.filename = filename.replace('md', 'html');
  fs.writeFileSync(`${settings.exportFolder}/${filename.replace('md', 'html')}`, article.html);
  return article;
};

const exportHomePage = (articles) => {
  const page = htmlExporter.exportHomepage(articles);
  fs.writeFileSync(`${settings.exportFolder}/index.html`, page.html);
}

const removeFiles = (folder) => {
  const files = fs.readdirSync(settings.exportFolder);
  files.map((file) => {
    if (file !== '.keep') {
      fs.unlinkSync(`${settings.exportFolder}/${file}`, (err) => {});
    }
    return file;
  });
}

processAll();
