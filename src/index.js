import fs from 'fs';
import yargs from 'yargs';
import MarkdownImporter from './importer/markdown';
import SiteExporter from './exporter/siteExporter';
import settings from './settings';

const processAll = (argv) => {
  importNew(argv).then(() => {
    exportAll(argv);
  });
}

const importNew = (argv) => {
  if (argv.verbose) {
    console.log('Importing new content…');
  }
  return processNewFiles(settings.sourceFolder);
}

const exportAll = (argv) => {
  const siteExporter = new SiteExporter();

  if (argv.verbose) {
    console.log('Exporting site…');
  }
  return siteExporter.exportSite();
}

const processNewFiles = (sourceFolder) => {
  return new Promise((resolve, reject) => {
    fs.readdir(sourceFolder, (err, files) => {
      if (err) {
        reject(err);
      }
      const markdownImporter = new MarkdownImporter();

      const result = files.filter(file => file.endsWith('.md')).map((file) => {
        return markdownImporter.importFile(file, sourceFolder);
      });

      Promise.all(result).then(resolve).catch(reject);
    });
  });
}

const argv = yargs
  .command(['process-all', '$0'], 'Process all', () => {}, (argv) => {
    processAll(argv);
  })
  .command(['export-all'], 'Export all', () => {}, (argv) => {
    exportAll(argv);
  })
  .command(['import-new'], 'Import new', () => {}, (argv) => {
    importNew(argv);
  })
  .option('verbose', {
    alias: 'v',
    default: false
  })
  .argv;

