import clsx from "clsx";
import styles from './styles.module.css';
import Heading from '@theme/Heading';

function ImageElement({ imageUrl, imageAlt }: { imageUrl: string, imageAlt: string }): JSX.Element {
    return (
        <div className={clsx(styles.colMd6, styles.centeredText)}>
            <img src={imageUrl} alt={imageAlt} className={styles.centeredImage} />
        </div>
    );
}

export const ImageAndText = (props: { title: any; imageUrl: any; imageAlt: any; children: any; gray?: boolean; imageOnTheRight?: boolean }) => {
    const {
        title,
        imageUrl,
        imageAlt,
        children,
        gray = false,
        imageOnTheRight = false
    } = props;

    // TODO: Fix that gray, would only change background color from theme slightly
    // TODO: Fix that title shows on top of children
    return (
        <section className={clsx(`margin-top--lg margin-bottom--lg`, styles.flexContainer, gray && styles.bgGrey100)}>
            {!imageOnTheRight && <ImageElement imageUrl={imageUrl} imageAlt={imageAlt} />}
            <div className={clsx(styles.colMd6, styles.flexItem, styles.flexTextDiv)}>
                <Heading as="h1" className='hero__title'>{title}</Heading>
                <span className={clsx(styles.colMd6, styles.centeredText)}>
                    {children}
                </span>
            </div>
            {imageOnTheRight && <ImageElement imageUrl={imageUrl} imageAlt={imageAlt} />}
        </section>
    );
};