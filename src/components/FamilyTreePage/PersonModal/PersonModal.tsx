import Modal from '../../common/Modal/Modal';
import Form from '../../common/Form/Form';
import { useDispatch } from 'react-redux';
import { addPerson, removePerson, updatePerson } from '@/features/tree/treeSlice';
import Title from '../../common/Title/Title';
import type { ButtonConfig, FormField } from '../../common/ui.types';
import { Gender, LifeEvent, Person } from '@/features/tree/types';
import styles from './PersonModal.module.css';

interface PersonModalProps {
    person?: Person;
    onClose: () => void;
}

type PersonFormValues = {
    firstName: string;
    lastName: string;
    maidenName: string;
    gender: Gender;
    photo: string | null;

    dateOfBirth: LifeEvent['date'];
    placeOfBirth: LifeEvent['place'];

    dateOfDeath: LifeEvent['date'];
    placeOfDeath: LifeEvent['place'];
};

const PersonModal = ({ person, onClose }: PersonModalProps) => {
    const dispatch = useDispatch();
    const isEdit = !!person;

    const handleDelete = () => {
        if (person) {
            dispatch(removePerson(person.id));
        }
        onClose();
    };

    const makeLifeEvent = (date?: string, place?: string): LifeEvent | undefined => {
        const d = date?.trim() || undefined;
        const p = place?.trim() || undefined;
        return d || p ? { date: d, place: p } : undefined;
    };

    const handleSubmit = (values: PersonFormValues) => {
        const basePerson: Partial<Person> = {
            givenName: values.firstName,
            familyName: values.lastName,
            maidenName: values.maidenName,
            gender: values.gender,
            photoUrl: values.photo,
            birth: makeLifeEvent(values.dateOfBirth, values.placeOfBirth),
            death: makeLifeEvent(values.dateOfDeath, values.placeOfDeath),
        };

        if (person) {
            dispatch(
                updatePerson({
                    id: person.id, changes: basePerson,
                }),
            );
        } else {
            dispatch(
                addPerson({
                    ...basePerson,
                }),
            );
        }

        onClose();
    };

    const GENDER_OPTIONS = [
        { value: 'female', label: 'Female' },
        { value: 'male', label: 'Male' },
        { value: 'unknown', label: 'Unknown' },
    ] as const;

    const fields = [
        { name: 'personPhoto', placeholder: 'Photo', type: 'file' },
        { name: 'gender', options: GENDER_OPTIONS, type: 'radio' },

        { name: 'firstName', placeholder: 'First name', type: 'text' },
        { name: 'lastName', placeholder: 'Last name', type: 'text' },
        { name: 'maidenName', placeholder: 'Maiden name', type: 'text' },

        { name: 'dateOfBirth', placeholder: 'Date of Birth', type: 'text' },
        { name: 'placeOfBirth', placeholder: 'Place of Birth', type: 'text' },

        { name: 'dateOfDeath', placeholder: 'Date of Death', type: 'text' },
        { name: 'placeOfDeath', placeholder: 'Place of Death', type: 'text' },
    ] satisfies ReadonlyArray<FormField>;

    const baseButtons = [
        {
            label: 'Okay',
            style: 'red',
            type: 'button',
            actionType: 'submit',
        },
        {
            label: 'Cancel',
            style: 'black',
            type: 'button',
            actionType: 'button',
            onClick: () => onClose(),
        },
    ] satisfies ReadonlyArray<ButtonConfig>;

    const deleteButton = {
        label: 'Delete person',
        style: 'trans',
        type: 'button',
        actionType: 'button',
        onClick: handleDelete,
    } satisfies ButtonConfig;

    const buttons = isEdit ? [...baseButtons, deleteButton] : baseButtons;

    const formLayout = `"personPhoto ."
                        "firstName dateOfBirth"
                        "lastName placeOfBirth"
                        "maidenName ."
                        "dateOfDeath placeOfDeath"
                        "buttons buttons"`;

    const formColumns = '1fr 1fr';
    const formRows = '160px 40px 40px 40px 40px';

    const initialValues: PersonFormValues = person
        ? {
            firstName: person.givenName ?? '',
            lastName: person.familyName ?? '',
            maidenName: person.maidenName ?? '',
            gender: person.gender ?? 'unknown',
            photo: person.photoUrl ?? null,

            dateOfBirth: person.birth?.date ?? '',
            placeOfBirth: person.birth?.place ?? '',

            dateOfDeath: person.death?.date ?? '',
            placeOfDeath: person.death?.place ?? '',
        }
        : {
            firstName: '',
            lastName: '',
            maidenName: '',
            gender: 'unknown',
            photo: null,

            dateOfBirth: '',
            placeOfBirth: '',
            dateOfDeath: '',
            placeOfDeath: '',
        };

    return (
        <Modal onClose={onClose} btnClose={true}>
            <div className={styles.editModal}>
                <Title level={'h2'} size={'small'}>
                    {isEdit ? 'Edit person' : 'Add person'}
                </Title>
                <Form
                    className={styles.form}
                    buttons={buttons}
                    fields={fields}
                    initialValues={initialValues}
                    formLayout={formLayout}
                    formColumns={formColumns}
                    formRows={formRows}
                    onSubmit={handleSubmit}
                />
            </div>
        </Modal>
    );
};

export default PersonModal;
