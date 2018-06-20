import showdown from 'showdown';
import yaml from 'yaml-js';
import dot from 'dot';

class Md2Html {
  constructor() {
    this.converter = new showdown.Converter({
      ghCompatibleHeaderId: true,
      simplifiedAutoLink: true,
      excludeTrailingPunctuationFromURLs: true,
      simpleLineBreaks: true,
      completeHTMLDocument: false,
      metadata: true,
    });

    this.dots = dot.process({ path: "./views"});
  }

  exportArticle(markDown) {
    const articleContent = this.converter.makeHtml(markDown);
    const metadata = yaml.load(this.converter.getMetadata(true));
    const article = {
      metadata: metadata,
      content: articleContent,
    };
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