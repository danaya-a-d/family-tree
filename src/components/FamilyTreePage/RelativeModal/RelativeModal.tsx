import Modal from '../../common/Modal/Modal';
import { Id, Person, RelativeKind } from '@/features/tree/types';
import styles from './RelativeModal.module.css';
import { useState } from 'react';

interface RelativeModalProps {
    anchor: Person;
    onPick: (kind: RelativeKind) => void;
    onClose: () => void;
}

const PersonModal = ({ anchor, onPick, onClose }: RelativeModalProps) => {

    const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);

    const GROUPS: { title: string; kinds: RelativeKind[] }[] = [
        { title: 'Parents', kinds: ['mother', 'father'] },
        { title: 'Partner', kinds: ['spouse'] },
        { title: 'Children', kinds: ['son', 'daughter'] },
        { title: 'Siblings', kinds: ['sister', 'brother'] },
    ];

    const LABEL: Record<RelativeKind, string> = {
        mother: 'Add mother', father: 'Add father',
        spouse: 'Add partner',
        son: 'Add son', daughter: 'Add daughter',
        brother: 'Add brother', sister: 'Add sister',
    };

    const openAddPersonModal = () => {
        setIsAddPersonOpen(true);
    };

    const closeAddPersonModal = () => {
        setIsAddPersonOpen(false);
    };

    return (
        <Modal onClose={onClose} btnClose>
            <div className={styles.relativeModal}>
                <div className={styles.rootPerson}>
                    <div className={styles.personPhoto}>
                        {anchor.portrait && <img src={anchor.portrait} alt={anchor.givenName} />}
                    </div>

                    <div className={styles.personName}>
                        <span>{anchor.givenName}</span>
                        <span>{anchor.familyName}</span>
                    </div>
                </div>

                <div className={styles.relatives}>
                    {GROUPS.map(g => (
                        <ul className={styles.relativeList}>
                            {g.kinds.map(k => (
                                <li key={k} className={styles.relativeItem}>
                                    <button className={styles.relativeButton} type='button'
                                            onClick={() => onPick(k)}>{LABEL[k]}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default PersonModal;
