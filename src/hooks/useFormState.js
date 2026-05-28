import { useCallback, useState } from "react";

export function useFormState(initialState) {
  const [values, setValues] = useState(initialState);

  const handleChange = useCallback(
    (key) => (event) => {
      const value = event?.target?.value;
      setValues((current) => ({ ...current, [key]: value }));
    },
    []
  );

  const resetForm = useCallback(
    (nextState = initialState) => {
      setValues(nextState);
    },
    [initialState]
  );

  return {
    values,
    setValues,
    handleChange,
    resetForm,
  };
}
