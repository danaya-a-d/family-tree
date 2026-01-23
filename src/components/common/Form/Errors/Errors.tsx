import { useEffect, useRef, useState } from 'react';
import type { ErrorsMap } from '../../ui.types';
import Toasts from '../../Toast/Toasts';

interface ErrorsProps {
    submitCount: number;
    globalErrors?: ErrorsMap;
    localErrors?: ErrorsMap;
    externalLocalErrors?: ErrorsMap;
}

const hasAny = (m?: ErrorsMap) => !!m && Object.keys(m).length > 0;

const Errors = ({
                    submitCount,
                    globalErrors = {} as ErrorsMap,
                    localErrors = {} as ErrorsMap,
                    externalLocalErrors = {} as ErrorsMap,
                }: ErrorsProps) => {

    const prevSubmit = useRef<number>(submitCount);
    const [mode, setMode] = useState<'global' | 'local' | 'external'>('local');

    useEffect(() => {
        if (submitCount !== prevSubmit.current) {
            prevSubmit.current = submitCount;
            setMode('global');
        }
    }, [submitCount]);

    useEffect(() => {
        setMode('local');
    }, [localErrors]);

    useEffect(() => {
        if (hasAny(externalLocalErrors)) {
            setMode('external');
        }
    }, [externalLocalErrors]);

    const errorsForToast: ErrorsMap =
        mode === 'external' && hasAny(externalLocalErrors)
            ? externalLocalErrors
            : mode === 'global' && hasAny(globalErrors)
                ? globalErrors
                : localErrors;

    return <Toasts errors={errorsForToast} />;
};

export default Errors;
