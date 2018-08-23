import showdown from 'showdown';
import yaml from 'yaml-js';
import dot from 'dot';
import settings from '../settings';

class Md2Html {
  constructor() {
    this.converter = new showdown.Converter({
      ghCompatibleHeaderId: true,
      headerLevelStart: 2,
      simplifiedAutoLink: true,
      excludeTrailingPunctuationFromURLs: true,
      simpleLineBreaks: true,
      completeHTMLDocument: false,
      metadata: true,
    });

    this.dots = dot.process({ path: "./views"});
  }

  convertArticle(markDown) {
    const articleContent = this.converter.makeHtml(markDown);
    const metadata = yaml.load(this.converter.getMetadata(true));

    const date = new Date(metadata.pubDate);
    const pubDateString = `${`0${date.getDate()}`.slice(-2)} / ${`0${date.getMonth()+1}`.slice(-2)} / ${date.getFullYear()}`;

    return {
      metadata: metadata,
      content: articleContent,
      pubDate: date,
      pubDateString,
    };
  }

  exportArticle(markDown) {
    const article = this.convertArticle(markDown)

    const page = {
      settings,
      title: article.metadata.title,
      content: this.dots.article(article),
    };

    article.html = this.dots.page(page);
    return article;
  }

  exportHomepage(articles) {
    const page = {
      settings,
      title: 'Liste des articles',
      content: this.dots.homepage({settings, articles}),
    };
    const html = this.dots.page(page);
    return {html};
  }
}

export default Md2Html;