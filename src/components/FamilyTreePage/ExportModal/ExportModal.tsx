import { ChangeEventHandler, useRef } from 'react';
import { useDispatch, useStore } from 'react-redux';
import Modal from '../../common/Modal/Modal';
import Button from '@/components/common/Button/Button';
import type { RootState } from '@/app/store';
import type { TreeState } from '@/features/tree/treeSlice';
import { replaceTree } from '@/features/tree/treeSlice';
import styles from './ExportModal.module.css';

interface ExportModalProps {
    onClose: () => void;
}

type ExportFile = {
    schemaVersion: 1;
    exportedAt: string;
    tree: TreeState;
};

const ExportModal = ({ onClose }: ExportModalProps) => {
    const dispatch = useDispatch();
    const store = useStore<RootState>();
    const fileRef = useRef<HTMLInputElement | null>(null);

    const doExport = () => {
        const state = store.getState();

        const payload: ExportFile = {
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            tree: state.tree,
        };

        const json = JSON.stringify(payload, null, 2);
        const blob = new Blob([json], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'family-tree.json';
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
            const parsed = JSON.parse(text) as Partial<ExportFile>;

            if (parsed?.schemaVersion !== 1 || !parsed.tree) {
                alert('Invalid file format');
                return;
            }
            if (!parsed.tree.persons || !parsed.tree.families || !parsed.tree.activeSpouseFamily) {
                alert('Invalid tree data');
                return;
            }

            dispatch(replaceTree(parsed.tree));
            onClose();
        } catch {
            alert('Failed to import file');
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
                        accept="application/json"
                        style={{ display: 'none' }}
                        onChange={onImportFile}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
