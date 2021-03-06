import React, {
  FC,
  ReactElement,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { connect, FormikContext } from 'formik';
import { useDebouncedCallback } from 'use-debounce';
import { useSnackbar } from 'notistack';
import { equals } from 'ramda';

export type FormikAutoSaveProps = {
  formik: FormikContext<any>;
  children?: (args: { isSubmitting: boolean; lastSaved: Date }) => ReactElement;
  timeout?: number;
};

const InternalFormikAutoSave: FC<FormikAutoSaveProps> = ({
  children,
  timeout = 300,
  formik,
}) => {
  const [lastSaved, setLastSaved] = useState<Date>(null);
  const { enqueueSnackbar } = useSnackbar();

  const save = useCallback(async () => {
    try {
      await formik.submitForm();
      setLastSaved(new Date());
    } catch (err) {
      console.error(err);
      enqueueSnackbar(
        'There was an error! Your last changes may not have been saved.',
      );
    }
  }, [formik, setLastSaved, enqueueSnackbar]);
  const [debouncedSave] = useDebouncedCallback(save, timeout);

  const previousValuesRef = useRef<any | null>(formik.values);

  useEffect(() => {
    if (!equals(formik.values, previousValuesRef.current)) {
      debouncedSave();
    }
    previousValuesRef.current = formik.values;
  }, [formik.values, previousValuesRef]);

  return children
    ? children({ isSubmitting: formik.isSubmitting, lastSaved })
    : null;
};

export const FormikAutoSave = connect(InternalFormikAutoSave) as FC<
  Omit<FormikAutoSaveProps, 'formik'>
>;
