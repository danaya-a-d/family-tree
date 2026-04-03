import Modal from '../../common/Modal/Modal';
import Title from '@/components/common/Title/Title';
import { AnchorPerson, SpousesForPerson } from '@/features/tree/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import {
    selectActiveSpouseFamilyId,
    selectSpousesOfPerson,
    selectSpouseFamilyCountMap,
} from '@/features/tree/selectors';
import { setActiveSpouseFamily } from '@/features/tree/treeSlice';
import { formatPartialDate } from '@/features/tree/lib/formatPartialDate';
import marriageIcon from '@/assets/img/marriage-icon.svg';
import divorceIcon from '@/assets/img/divorce-icon.svg';
import styles from './SpouseModal.module.css';

interface RelativeModalProps {
    anchor: AnchorPerson;
    onClose: () => void;
}

const SpouseModal = ({ anchor, onClose }: RelativeModalProps) => {
    const dispatch = useDispatch();

    const spouses: SpousesForPerson[] = useSelector((s: RootState) =>
        anchor ? selectSpousesOfPerson(s, anchor.id) : [],
    );

    const activeFamilyId = useSelector((s: RootState) =>
        selectActiveSpouseFamilyId(s, anchor.id),
    );

    const spouseFamilyCountMap = useSelector(selectSpouseFamilyCountMap);

    const onPick = (familyId: string, spouseId: string | null) => {
        dispatch(setActiveSpouseFamily({ personId: anchor.id, familyId }));
        if (spouseId) {
            dispatch(setActiveSpouseFamily({ personId: spouseId, familyId }));
        }

        onClose();
    };

    return (
        <Modal onClose={onClose} btnClose>
            <div className={styles.spouseModal}>
                <Title level={'h2'} size={'small'} className={styles.title}>
                    Select spouse of
                    {' ' + anchor.name + ' ' + anchor.surname}
                </Title>

                <div className={styles.wrapper}>
                    <ul className={styles.spouses}>
                        {spouses.map((s) => {
                            const famCount = s.spouseId ? (spouseFamilyCountMap[s.spouseId] ?? 0) : 0;

                            return (
                                <li
                                    key={`${s.familyId}-${s.spouseId ?? 'none'}`}
                                    className={`${styles.spouse} ${s.familyId === activeFamilyId ? styles.spouseActive : ''}`.trim()}
                                    role='button'
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (s.familyId === activeFamilyId) return;
                                        onPick(s.familyId, s.spouseId);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key !== 'Enter' && e.key !== ' ') return;
                                        e.preventDefault();
                                        if (s.familyId === activeFamilyId) return;
                                        onPick(s.familyId, s.spouseId);
                                    }}>
                                    <div className={styles.photo}>
                                        {s.spousePortrait && <img src={s.spousePortrait} alt={s.spouseLabel} />}
                                    </div>

                                    <div className={styles.about}>
                                        <div className={styles.name}>
                                            <span>{s.spouseLabel}</span>
                                        </div>

                                        <div className={styles.dates}>
                                            {s.marriage && (
                                                <div className={styles.date}>
                                                    <img className={styles.spouseIcon} src={marriageIcon}
                                                         alt='Marriage' />
                                                    {formatPartialDate(s?.marriage?.date?.from)}
                                                </div>
                                            )}

                                            {s.divorce && s.marriage && <span>{'\u00A0-\u00A0'}</span>}

                                            {s.divorce && (
                                                <div className={styles.date}>
                                                    <img className={styles.spouseIcon} src={divorceIcon}
                                                         alt='Divorce' />
                                                    {formatPartialDate(s?.divorce?.date?.from)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {s.spouseId && famCount > 1 && (
                                        <span className={styles.sousesLabel}>
                                            +{famCount - 1} families
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </Modal>
    );
};

export default SpouseModal;
