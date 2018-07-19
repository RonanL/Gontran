import fs from 'fs';
import yargs from 'yargs';
import dot from 'dot';
import MarkdownImporter from './importer/markdown';
import SiteExporter from './exporter/siteExporter';
import RssExporter from './exporter/rssExporter';
import settings from './settings';

const processAll = (argv) => {
  importNew(argv).then(() => {
    return exportHtml(argv);
  }).then(() => {
    return exportRss(argv);
  });
}

const importNew = (argv) => {
  if (argv.verbose) {
    console.log('Importing new content…');
  }
  return processNewFiles(settings.sourceFolder);
}

const exportHtml = (argv) => {
  const siteExporter = new SiteExporter();

  if (argv.verbose) {
    console.log('Exporting site…');
  }
  return siteExporter.exportSite();
}

const exportRss = (argv) => {
  const rssExporter = new RssExporter();

  if (argv.verbose) {
    console.log('Exporting RSS feed…');
  }
  return rssExporter.export();
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
    exportHtml(argv);
  })
  .command(['import-new'], 'Import new', () => {}, (argv) => {
    importNew(argv);
  })
  .command(['export-rss'], 'Export rss', () => {}, (argv) => {
    exportRss(argv);
  })
  .option('verbose', {
    alias: 'v',
    default: false
  })
  .argv;

// Disable dot.js log when not in verbose mode
if (!argv.verbose) {
  dot.log = false;
}
