import Modal from '../../common/Modal/Modal';
import { AnchorPerson, RelativeKind } from '@/features/tree/types';
import styles from './RelativeModal.module.css';
import bornIcon from '@/assets/img/born-icon.svg';
import deathIcon from '@/assets/img/death-icon.svg';
import Title from '@/components/common/Title/Title';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { selectParentInfo } from '@/features/tree/selectors';

interface RelativeModalProps {
    anchor: AnchorPerson;
    onPick: (kind: RelativeKind) => void;
    onClose: () => void;
}

const RelativeModal = ({ anchor, onPick, onClose }: RelativeModalProps) => {

    const { count, hasMother, hasFather } = useSelector((s: RootState) =>
        selectParentInfo(s, anchor.id),
    );

    const hasTwoParents = count >= 2;
    const disableMother = hasTwoParents || hasMother;
    const disableFather = hasTwoParents || hasFather;

    const GROUPS: { title: string; kinds: RelativeKind[] }[] = [
        { title: 'Parents', kinds: ['mother', 'father'] },
        { title: 'Partner', kinds: ['spouse'] },
        { title: 'Children', kinds: ['daughter', 'son'] },
        { title: 'Siblings', kinds: ['sister', 'brother'] },
    ];

    const LABEL: Record<RelativeKind, string> = {
        mother: 'Add mother', father: 'Add father',
        spouse: 'Add partner',
        daughter: 'Add daughter', son: 'Add son',
        brother: 'Add brother', sister: 'Add sister',
    };

    const DISABLED_BY_KIND: Partial<Record<RelativeKind, boolean>> = {
        mother: disableMother,
        father: disableFather,
    };

    return (
        <Modal onClose={onClose} btnClose>
            <div className={styles.relativeModal}>
                <Title level={'h2'} size={'small'}>Add relative</Title>

                <div className={styles.wrapper}>
                    <div className={styles.rootPerson}>
                        <div className={styles.photo}>
                            {anchor.photo && <img src={anchor.photo} alt={anchor.name} />}
                        </div>
                        <div className={styles.about}>
                            <div className={styles.name}>
                                <span>{anchor.name}</span>
                                <span>{anchor.surname}</span>
                            </div>

                            {(anchor.birth || anchor.death) && (
                                <div className={styles.dates}>
                                    {anchor.birth && (
                                        <div className={styles.date}>
                                            <img className={styles.lifeIcon} src={bornIcon} alt='Born' />
                                            {anchor.birth}
                                        </div>
                                    )}

                                    {(anchor.death && anchor.birth) && (
                                        <span>{'\u00A0-\u00A0'}</span>
                                    )}

                                    {anchor.death && (
                                        <div className={styles.date}>
                                            <img className={styles.lifeIcon} src={deathIcon} alt='Death' />
                                            {anchor.death}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.relatives}>
                        {GROUPS.map(g => (
                            <ul className={styles.relativeList}>
                                {g.kinds.map(k => (
                                    <li key={k} className={styles.relativeItem}>
                                        <button className={styles.relativeButton}
                                                type='button'
                                                disabled={!!DISABLED_BY_KIND[k]}
                                                onClick={() => onPick(k)}>{LABEL[k]}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default RelativeModal;
