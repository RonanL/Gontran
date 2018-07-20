import showdown from 'showdown';
import yaml from 'yaml-js';
import dot from 'dot';

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

    return {
      metadata: metadata,
      content: articleContent,
    };
  }

  exportArticle(markDown) {
    const article = this.convertArticle(markDown)

    const page = {
      title: metadata.title,
      content: this.dots.article(article),
    };

    const html = this.dots.page(page);
    return {
      html,
      metadata,
    };
  }

  exportHomepage(articles) {
    const page = {
      title: 'Liste des articles',
      content: this.dots.homepage({articles}),
    };
    const html = this.dots.page(page);
    return {html};
  }
}

export default Md2Html;