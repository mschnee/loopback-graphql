import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Admonition from '@theme/Admonition';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.hero)}>
      <div className={clsx(styles.heroContainer)}>
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout description="Documentation for @loopback/graphql">
      <HomepageHeader />
      <main className={clsx(styles.main)}>
        <Admonition type="danger">
          <h2>This is an extremely early Alpha Preview</h2>
          <p>These packages:</p>
          <ul>
            <li>
              do not conform or comply with <b>any Loopback standards</b>
            </li>
            <li>
              do not work and are <b>not functional</b>
            </li>
            <li>
              are <b>not suitable</b> for inclusion in the loopback monorepository
            </li>
          </ul>
        </Admonition>
      </main>
    </Layout>
  );
}
