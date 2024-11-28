import clsx from 'clsx';
import {type Feature} from '@site/src/data/features';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

function FeatureCard({user}: {user: Feature}) {
  return (
    <li key={user.title} className="card shadow--md">
      <div className="card__body">
        <div className={clsx(styles.showcaseCardHeader)}>
          <Heading as="h4" className={styles.showcaseCardTitle}>
              {user.title}
          </Heading>
        </div>
        <p className={styles.showcaseCardBody}>{user.description}</p>
      </div>
    </li>
  );
}

export default FeatureCard;