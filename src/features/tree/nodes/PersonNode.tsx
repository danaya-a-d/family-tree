import { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { setRootPerson } from '@/features/tree/treeSlice';
import { selectPersonById } from '@/features/tree/selectors';
import type { RootState } from '@/app/store';
import { PERSON_SIZE } from '@/components/common/constants';
import { RelativeKind, AddRelativeContext, PartialDate, AnchorPerson } from '@/features/tree/types';
import styles from './PersonNode.module.css';

import femalePlaceholder from '@/assets/img/pl-female.jpg';
import malePlaceholder from '@/assets/img/pl-male.jpg';
import unknownPlaceholder from '@/assets/img/pl-unknown.jpg';

import deathIcon from '@/assets/img/death-icon.svg';
import bornIcon from '@/assets/img/born-icon.svg';

import MenuEdit from '@/components/common/MenuEdit/MenuEdit';
import PersonModal from '@/components/FamilyTreePage/PersonModal/PersonModal';
import RelativeModal from '@/components/FamilyTreePage/RelativeModal/RelativeModal';

type PersonData = {
    personId: string;
    name: string;
    surname: string;
    photoUrl?: string;
    birth?: PartialDate;
    death?: PartialDate;
};

type RFPersonNode = Node<PersonData>;

const PersonNode = ({ id, data, selected }: NodeProps<RFPersonNode>) => {
    const [isAddRelativeOpen, setIsAddRelativeOpen] = useState(false);
    const [isEditPersonOpen, setIsEditPersonOpen] = useState(false);
    const [addCtx, setAddCtx] = useState<AddRelativeContext | null>(null);

    const dispatch = useDispatch();
    const rf = useReactFlow();

    const person = useSelector((s: RootState) =>
        selectPersonById(s, data.personId),
    );

    const formatPartialDate = (date?: PartialDate) => {
        if (!date) return '';

        const y = date.y?.toString() ?? '';
        const m = date.m?.toString().padStart(2, '0') ?? '';
        const d = date.d?.toString().padStart(2, '0') ?? '';

        if (y && m && d) return `${d}.${m}.${y}`;
        if (y && m) return `${m}.${y}`;
        return y;
    };

    const getDefaultPortrait = (gender?: 'male' | 'female' | 'unknown') =>
        gender === 'male' ? malePlaceholder : gender === 'female' ? femalePlaceholder : unknownPlaceholder;

    const personSurname = person ? `${person?.familyName ?? ''} ${person?.maidenName ? `(${person?.maidenName})` : ''}`.trim() : '';

    const personId = person?.id || data.personId;
    const birth = formatPartialDate(person?.birth?.date?.from ?? data.birth);
    const death = formatPartialDate(person?.death?.date?.from ?? data.death);
    const name = person?.givenName || data.name || 'Unknown';
    const surname = personSurname || data.surname || '';
    const photo = (person ? person?.portrait : data.photoUrl) || getDefaultPortrait(person?.gender);

    const anchor: AnchorPerson = { id: personId, photo, name, surname, birth, death };

    const onClick = () => {
        dispatch(setRootPerson(data.personId));

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
        {
            id: 3,
            name: 'See details',
            href: '#',
        },
    ];

    const handlePickRelative = (kind: RelativeKind) => {
        setIsAddRelativeOpen(false);
        setAddCtx({ anchorPersonId: personId, kind });
    };

    return (
        <div className={`${styles.card} ${selected ? styles.selected : ''}`} onClick={onClick}>
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

                        {(death && birth) && (
                            <span>{'\u00A0-\u00A0'}</span>
                        )}

                        {death && (
                            <div className={styles.date}>
                                <img className={styles.lifeIcon} src={deathIcon} alt='Death' />
                                {death}
                            </div>
                        )}
                    </div>
                </div>

                <MenuEdit menuList={menuList} listPosition='top' className={styles.editList} />
            </div>

            <Handle id='left' type='source' position={Position.Left} />
            <Handle id='right' type='source' position={Position.Right} />
            <Handle id='top' type='target' position={Position.Top} />

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
