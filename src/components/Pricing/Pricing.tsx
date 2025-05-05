import React from 'react';
import { educatesProject } from '../../data/project';
import styles from './styles.module.css';
import Heading from '@theme/Heading';

const Pricing: React.FC = () => {
    return (
        <section className={styles.pricingSection}>
            <Heading as="h1" className="section_title">Pricing</Heading>
            <span className={styles.pricingSubtitle}>
                Just kidding! Educates is free and open-source.<br />
                You can still make your contribution!
            </span>
            <div className={styles.pricingButtonRow}>
                <div className={styles.pricingButtonCol}>
                    <a
                        href={educatesProject.projectGitHubUrl}
                        className={styles.pricingButton}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className={styles.pricingIcon}>⭐</span> Give us a star
                    </a>
                    <a
                        href={educatesProject.contributingUrl}
                        className={styles.pricingButton}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className={styles.pricingIcon}>🗂️</span> Contribute
                    </a>
                </div>
                {/* <div className={styles.pricingButtonColCenter}>
                    <a
                        href={educatesProject.sponsorshipUrl}
                        className={styles.pricingButton}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span className={styles.pricingIcon}>🎁</span> Become a sponsor
                    </a>
                </div> */}
            </div>
        </section>
    );
};

export default Pricing; 