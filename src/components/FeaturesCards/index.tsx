import clsx from 'clsx';
import { allFeatures, type Feature } from '@site/src/data/features';
import FeatureCard from '../FeatureCard';

import styles from './styles.module.css';

function CardList({ items }: { items: Feature[] }) {
  return (
    <div className="container">
      <ul className={clsx('clean-list', styles.cardList)}>
        {items.map((item) => (
          <FeatureCard key={item.title} user={item} />
        ))}
      </ul>
    </div>
  );
}

export default function FeatureCards() {
  return (
    <section className="margin-top--lg margin-bottom--xl">
      <div className="margin-top--lg">
        <CardList items={allFeatures} />
      </div>
    </section>
  );
}