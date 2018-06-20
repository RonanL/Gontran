import fs from 'fs';
import MarkdownImporter from './importer/markdown';
import SiteExporter from './exporter/siteExporter';
import settings from './settings';

const markdownImporter = new MarkdownImporter();
const siteExporter = new SiteExporter();

const processAll = () => {
  processNewFiles(settings.sourceFolder).then(() => {
    siteExporter.exportSite();
  });
}

const processNewFiles = (sourceFolder) => {
  return new Promise((resolve, reject) => {
    fs.readdir(sourceFolder, (err, files) => {
      if (err) {
        reject(err);
      }

      const result = files.filter(file => file.endsWith('.md')).map((file) => {
        return markdownImporter.importFile(file, sourceFolder);
      });

      Promise.all(result).then(resolve).catch(reject);
    });
  });
}

processAll();
