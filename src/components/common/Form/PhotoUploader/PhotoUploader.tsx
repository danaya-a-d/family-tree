import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './PhotoUploader.module.css';
import MenuEdit from '@/components/common/MenuEdit/MenuEdit';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MenuItem } from '@/components/common/MenuEdit/MenuEdit.types';

interface PhotoUploaderProps {
    name: string;
    value?: string | null;
    className?: string;
    onChange?: (base64: string | null) => void;
}

const PhotoUploader = ({ name, value, className, onChange }: PhotoUploaderProps) => {
    const menuList: MenuItem[] = [];
    const [preview, setPreview] = useState<string | null>(value ?? null);

    const isTouchDevice = useMediaQuery('(hover: none), (pointer: coarse)');
    const [isNewUpload, setIsNewUpload] = useState(false);
    const lastLocalUploadRef = useRef<string | null>(null);

    useEffect(() => {
        setPreview(value ?? null);

        if (!value) {
            lastLocalUploadRef.current = null;
            setIsNewUpload(false);
            return;
        }

        setIsNewUpload(value === lastLocalUploadRef.current);
    }, [value]);

    const onDrop = useCallback(
        (acceptedFiles: File[]): void => {
            if (!acceptedFiles || !acceptedFiles.length) return;
            const file = acceptedFiles[0];

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = reader.result as string;

                lastLocalUploadRef.current = result;
                setIsNewUpload(true);

                setPreview(result);
                onChange?.(result);
            };
            reader.readAsDataURL(file);
        },
        [onChange],
    );

    const handleDelete = () => {
        lastLocalUploadRef.current = null;
        setIsNewUpload(false);
        setPreview(null);
        onChange?.(null);
    };

    // Dropzone setting
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        accept: { 'image/*': [] },
        multiple: false,
        onDrop,
        noClick: Boolean(preview) && isTouchDevice,
    });

    if (isTouchDevice) {
        menuList.push({
            id: menuList.length + 1,
            name: 'Change photo',
            onClick: open,
        });
    }

    if (preview && !isNewUpload) {
        menuList.push({
            id: menuList.length + 1,
            name: 'Open full',
            href: preview,
        });
    }

    if (preview) {
        menuList.push({
            id: menuList.length + 1,
            name: 'Delete photo',
            onClick: handleDelete,
        });
    }

    return (
        <div className={styles.wrapper}>
            {preview && <MenuEdit menuList={menuList}
                                  listPosition='right'
                                  buttonStyle='shadow'
                                  className={styles.editList}
            />}

            <div
                {...getRootProps()}
                className={`${styles.uploader} 
                      ${isDragActive ? styles.dragging : ''} 
                      ${!preview ? styles.noPreview : ''} 
                      ${className ?? ''}`.trim()}
            >
                <div className={`${styles.overlay} ${className ?? ''}`}>
                    <svg
                        className={styles.icon}
                        width='95'
                        height='72'
                        viewBox='0 0 95 72'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <g clipPath='url(#clip0_675_1316)'>
                            <path
                                d='M84.2292 10.6564H71.0487L70.0502 7.68134C69.4122 5.77137 68.1854 4.10993 66.5441 2.93299C64.9029 1.75603 62.9305 1.12342 60.9072 1.125H34.091C32.0677 1.12342 30.0953 1.75603 28.454 2.93299C26.8128 4.10993 25.586 5.77137 24.948 7.68134L23.9494 10.6564H10.7707C8.21525 10.6595 5.76537 11.6705 3.95826 13.4677C2.15116 15.265 1.13437 17.7019 1.13086 20.2438V61.5487C1.13393 64.091 2.15053 66.5282 3.95767 68.3259C5.76482 70.1235 8.21496 71.1348 10.7707 71.1378H84.2309C86.7865 71.1343 89.2365 70.1226 91.0433 68.3247C92.8502 66.5268 93.8664 64.0893 93.869 61.5471V20.2455C93.8659 17.7032 92.8493 15.266 91.0421 13.4684C89.235 11.6707 86.7849 10.6595 84.2292 10.6564Z'
                                stroke='black'
                            />
                            <path
                                d='M47.5008 17.0101C42.7516 17.0101 38.109 18.4111 34.1602 21.0357C30.2114 23.6603 27.1336 27.3908 25.3162 31.7555C23.4987 36.1201 23.0232 40.9228 23.9496 45.5562C24.8762 50.1898 27.1631 54.4459 30.5214 57.7864C33.8796 61.1269 38.1582 63.4019 42.8162 64.3235C47.4742 65.2452 52.3023 64.7721 56.69 62.9642C61.0778 61.1564 64.828 58.0948 67.4665 54.1667C70.105 50.2387 71.5134 45.6206 71.5134 40.8964C71.5064 34.5635 68.9742 28.492 64.4726 24.0139C59.9708 19.536 53.8672 17.0171 47.5008 17.0101ZM47.5008 61.4878C43.4067 61.4878 39.4044 60.2801 36.0003 58.0175C32.5961 55.7549 29.9429 52.539 28.3761 48.7763C26.8094 45.0137 26.3994 40.8735 27.1981 36.8791C27.9969 32.8848 29.9683 29.2157 32.8634 26.3359C35.7584 23.4562 39.4469 21.4949 43.4624 20.7005C47.4779 19.9059 51.64 20.3137 55.4226 21.8723C59.205 23.4307 62.4381 26.07 64.7127 29.4562C66.9872 32.8425 68.2013 36.8237 68.2013 40.8964C68.1952 46.3556 66.0122 51.5896 62.1315 55.4499C58.2507 59.3104 52.9891 61.4817 47.5008 61.4878Z'
                                stroke='black'
                            />
                            <path
                                d='M60.7483 39.249H49.156V27.7178C49.156 27.2808 48.9816 26.8619 48.6711 26.5529C48.3605 26.244 47.9392 26.0704 47.5001 26.0704C47.0608 26.0704 46.6396 26.244 46.3291 26.5529C46.0184 26.8619 45.844 27.2808 45.844 27.7178V39.249H34.2518C33.8125 39.249 33.3913 39.4226 33.0808 39.7315C32.7702 40.0405 32.5957 40.4594 32.5957 40.8964C32.5957 41.3332 32.7702 41.7523 33.0808 42.0612C33.3913 42.3701 33.8125 42.5437 34.2518 42.5437H45.844V54.0749C45.844 54.5118 46.0184 54.9308 46.3291 55.2398C46.6396 55.5487 47.0608 55.7222 47.5001 55.7222C47.9392 55.7222 48.3605 55.5487 48.6711 55.2398C48.9816 54.9308 49.156 54.5118 49.156 54.0749V42.5437H60.7483C61.1875 42.5437 61.6087 42.3701 61.9194 42.0612C62.2299 41.7523 62.4043 41.3332 62.4043 40.8964C62.4043 40.4594 62.2299 40.0405 61.9194 39.7315C61.6087 39.4226 61.1875 39.249 60.7483 39.249Z'
                                stroke='#9F0004'
                            />
                        </g>
                        <defs>
                            <clipPath id='clip0_675_1316'>
                                <rect width='95' height='72' fill='white' />
                            </clipPath>
                        </defs>
                    </svg>
                </div>

                <input {...getInputProps({ name })} />

                {preview ? <img src={preview} alt='Preview' className={styles.image} /> : null}
            </div>
        </div>
    );
};

export default PhotoUploader;
