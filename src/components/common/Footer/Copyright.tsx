import type { PropsWithChildren } from 'react';
import styles from './Copyright.module.css';

const Copyright = ({ children }: PropsWithChildren) => {
    return <p className={styles.text}>{children}</p>;
};

export default Copyright;
