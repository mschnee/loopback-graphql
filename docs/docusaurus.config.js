// Note: type annotations allow type checking and IDEs autocompletion


const themes = require('prism-react-renderer').themes;
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '@loopback/graphql',
  tagline: 'Bringing SOLID to your SDL',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://mschnee.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/loopback-graphql/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'loopback.io', // Usually your GitHub org/user name.
  projectName: 'graphql', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  stylesheets: [
    {href: 'https://fonts.googleapis.com/css?family=IBM+Plex+Sans', rel: 'stylesheet'},
    {href: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css', rel: 'stylesheet'},
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'LoopBack GraphQL',
        logo: {
          alt: 'Loopback Logo',
          src: 'img/loopback.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Tutorial',
          },
          {
            type: 'doc',
            docId: 'roadmap',
            position: 'left',
            label: 'Roadmap',
          },
          {
            href: 'https://github.com/mschnee/loopback-graphql',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
              {
                label: 'Roadmap',
                to: '/docs/roadmap',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/loopback',
              },
              {
                label: 'Slack',
                href: 'https://loopback.io',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Loopback',
                to: 'https://loopback.io',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/loopbackio/loopback-next',
              },
              {
                label: 'OpenJS Foundation',
                href: 'https://openjsf.org',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} IBM Corp., OpenJS Foundation and LoopBack contributors. All rights reserved. The OpenJS Foundation has registered trademarks and uses trademarks. For a list of trademarks of the OpenJS Foundation, please see our Trademark Policy and Trademark List. Trademarks and logos not indicated on the list of OpenJS Foundation trademarks are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
