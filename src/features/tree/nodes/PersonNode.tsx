import { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { setActiveSpouseFamily, setRootPerson } from '@/features/tree/treeSlice';
import { selectPersonById, selectSpousesOfPerson } from '@/features/tree/selectors';
import type { RootState } from '@/app/store';
import { PERSON_SIZE } from '@/components/common/constants';
import { RelativeKind, AddRelativeContext, AnchorPerson } from '@/features/tree/types';
import styles from './PersonNode.module.css';

import deathIcon from '@/assets/img/death-icon.svg';
import bornIcon from '@/assets/img/born-icon.svg';

import MenuEdit from '@/components/common/MenuEdit/MenuEdit';
import PersonModal from '@/components/FamilyTreePage/PersonModal/PersonModal';
import RelativeModal from '@/components/FamilyTreePage/RelativeModal/RelativeModal';
import SpouseModal from '@/components/FamilyTreePage/SpouseModal/SpouseModal';
import { formatPartialDate } from '@/features/tree/lib/formatPartialDate';
import { getDefaultPortrait } from '@/features/tree/lib/getDefaultPortrait';

type PersonData = {
    personId: string;
    shownSpouseFamilyId?: string | null;
};

type RFPersonNode = Node<PersonData>;

const PersonNode = ({ id, data, selected }: NodeProps<RFPersonNode>) => {
    const [isAddRelativeOpen, setIsAddRelativeOpen] = useState(false);
    const [isEditPersonOpen, setIsEditPersonOpen] = useState(false);
    const [isSelectSpouseOpen, setIsSelectSpouseOpen] = useState(false);
    const [addCtx, setAddCtx] = useState<AddRelativeContext | null>(null);

    const dispatch = useDispatch();
    const rf = useReactFlow();

    const person = useSelector((s: RootState) =>
        selectPersonById(s, data.personId),
    );

    const rootPersonId = useSelector((s: RootState) => s.tree.rootPersonId);

    const personId = data.personId;

    const name = person?.givenName?.trim() || 'Unknown';
    const surname = person
        ? `${person.familyName ?? ''} ${person.maidenName ? `(${person.maidenName})` : ''}`.trim()
        : '';

    const birth = formatPartialDate(person?.birth?.date?.from);
    const death = formatPartialDate(person?.death?.date?.from);
    const lifeStatus = person?.lifeStatus;

    const photo = person?.portrait || getDefaultPortrait(person?.gender);

    const anchor: AnchorPerson = { id: personId, photo, name, surname, lifeStatus, birth, death };

    const spouseCount = useSelector((s: RootState) =>
        selectSpousesOfPerson(s, personId).length,
    );

    const onClick = () => {
        if (rootPersonId !== personId) {
            const famId = data.shownSpouseFamilyId ?? null;
            if (famId) {
                dispatch(setActiveSpouseFamily({ personId, familyId: famId }));
            }
            dispatch(setRootPerson(personId));
            return;
        }

        const n = rf.getNode(id) as RFPersonNode | undefined;
        if (!n) return;

        const w = n.width ?? PERSON_SIZE.width;
        const h = n.height ?? PERSON_SIZE.height;
        const cx = n.position.x + w / 2;
        const cy = n.position.y + h / 2;

        rf.setCenter(cx, cy, { zoom: 1.1, duration: 300 });
    };

    const menuList = [
        {
            id: 1,
            name: 'Edit person',
            onClick: () => setIsEditPersonOpen(true),
        },
        {
            id: 2,
            name: 'Add relative',
            onClick: () => setIsAddRelativeOpen(true),
        },
    ];

    const handlePickRelative = (kind: RelativeKind) => {
        setIsAddRelativeOpen(false);
        setAddCtx({ anchorPersonId: personId, kind });
    };

    return (
        <div className={`${styles.card} ${selected ? styles.selected : ''}`.trim()} onClick={onClick}>
            <div className={styles.info}>
                <div className={styles.photo}>
                    {photo && <img src={photo} alt={name} />}
                </div>
                <div className={styles.about}>
                    <div className={styles.name}>
                        <span>{name}</span>
                        <span>{surname}</span>
                    </div>
                    <div className={styles.dates}>
                        {birth && (
                            <div className={styles.date}>
                                <img className={styles.lifeIcon} src={bornIcon} alt='Born' />
                                {birth}
                            </div>
                        )}

                        {(lifeStatus === 'deceased' && birth) && (
                            <span>{'\u00A0-\u00A0'}</span>
                        )}

                        {lifeStatus === 'deceased' && (
                            <div className={styles.date}>
                                <img className={styles.lifeIcon} src={deathIcon} alt='Death' />
                                {death}
                            </div>
                        )}
                    </div>
                </div>

                {spouseCount > 1 && (
                    <button
                        type='button'
                        className={styles.sousesBtn}
                        onClick={() => setIsSelectSpouseOpen(true)}
                    >
                        +{spouseCount - 1} families
                    </button>
                )}

                <div data-node-menu="true">
                    <MenuEdit
                        menuList={menuList}
                        listPosition='bottom'
                        className={styles.editList}
                    />
                </div>
            </div>

            <Handle id='left' type='source' position={Position.Left} />
            <Handle id='right' type='source' position={Position.Right} />
            <Handle id='top' type='target' position={Position.Top} />

            {isSelectSpouseOpen &&
                <SpouseModal
                    onClose={() => setIsSelectSpouseOpen(false)}
                    anchor={anchor}
                />}

            {isAddRelativeOpen &&
                <RelativeModal
                    anchor={anchor}
                    onClose={() => setIsAddRelativeOpen(false)}
                    onPick={handlePickRelative}
                />}

            {isEditPersonOpen &&
                <PersonModal
                    onClose={() => setIsEditPersonOpen(false)}
                    person={person}
                />}

            {addCtx && (
                <PersonModal
                    addContext={addCtx}
                    onClose={() => setAddCtx(null)}
                />
            )}
        </div>
    );
};

export default memo(PersonNode);
