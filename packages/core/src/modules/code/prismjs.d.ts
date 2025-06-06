declare module "prismjs" {
  const Prism: {
    highlightAll: () => void;
    highlight: (code: string, grammar: any, language: string) => string;
    languages: {
      [language: string]: any;
    };
  };
  export default Prism;
}

declare module "prismjs/plugins/line-highlight/prism-line-highlight" {}
declare module "prismjs/plugins/line-numbers/prism-line-numbers" {}
declare module "prismjs/components/prism-jsx" {}
declare module "prismjs/components/prism-css" {}
declare module "prismjs/components/prism-typescript" {}
declare module "prismjs/components/prism-tsx" {}
