import type { ChangeEventHandler } from 'react';
import { useRef } from 'react';
import { useDispatch, useStore } from 'react-redux';
import Modal from '../../common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import type { RootState } from '@/app/store';
import { replaceTree } from '@/features/tree/treeSlice';
import { exportGedcom, importGedcom } from '@/features/tree/gedcom';
import { embedRemotePortraits } from './embedRemotePortraits';
import { showToastMessages } from './showToastMessages';
import styles from './ExportModal.module.css';

interface ExportModalProps {
    onClose: () => void;
}

const GEDCOM_ACCEPT = '.ged,.gedcom,text/plain,application/x-gedcom,text/x-gedcom';
const GEDCOM_BLOB_TYPE = 'text/plain;charset=utf-8';
const GEDCOM_FILE_NAME = 'family-tree.ged';

const ExportModal = ({ onClose }: ExportModalProps) => {
    const dispatch = useDispatch();
    const store = useStore<RootState>();
    const fileRef = useRef<HTMLInputElement | null>(null);

    const doExport = () => {
        const state = store.getState();
        const result = exportGedcom(state.tree);

        if (result.warnings.length > 0) {
            console.warn('GEDCOM export warnings', result.warnings);
            showToastMessages(['Some details could not be exported']);
        }

        const blob = new Blob([result.data], { type: GEDCOM_BLOB_TYPE });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = GEDCOM_FILE_NAME;
        a.click();
        URL.revokeObjectURL(url);
    };

    const doImportClick = () => fileRef.current?.click();

    const onImportFile: ChangeEventHandler<HTMLInputElement> = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        try {
            const text = await file.text();
            const result = importGedcom(text);

            if (result.error) {
                showToastMessages(['Could not import this GEDCOM file']);
                return;
            }

            const portraitResult = await embedRemotePortraits(result.data);

            dispatch(replaceTree(portraitResult.tree));

            if (result.warnings.length > 0) {
                console.warn('GEDCOM import warnings', result.warnings);
            }

            if (portraitResult.warnings.length > 0) {
                console.warn('GEDCOM portrait embedding warnings', portraitResult.warnings);
            }

            showToastMessages([
                result.warnings.length > 0
                    ? 'Some GEDCOM details could not be imported'
                    : '',
                    portraitResult.warnings.length > 0
                        ? 'Some portraits could not be saved'
                        : '',
            ]);

            onClose();
        } catch {
            showToastMessages(['Could not import this GEDCOM file']);
        }
    };

    return (
        <Modal onClose={onClose} btnClose>
            <div className={styles.exportModal}>
                <div className={styles.wrapper}>
                    <Button
                        type="button"
                        style="red"
                        actionType="button"
                        onClick={doExport}
                    >
                        Export family tree
                    </Button>

                    <Button
                        type="button"
                        style="red"
                        actionType="button"
                        onClick={doImportClick}
                    >
                        Import family tree
                    </Button>

                    <input
                        ref={fileRef}
                        type="file"
                        accept={GEDCOM_ACCEPT}
                        style={{ display: 'none' }}
                        onChange={onImportFile}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
