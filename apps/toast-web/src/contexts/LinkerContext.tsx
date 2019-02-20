import React, { createContext, useState } from 'react';

interface LinkerContextValue {
  open: boolean;
  working: boolean;
  error: Error;
  lastResult: {
    recipe: any;
    problems: any;
  };
  setOpen(open: boolean): void;
  setWorking(working: boolean): void;
  setError(err: Error): void;
  setLastResult(res: { problems: any; recipe: any }): void;
  reset(): void;
}

const LinkerContext = createContext<LinkerContextValue>({
  open: false,
  working: false,
  error: null,
  lastResult: null,
  setOpen() {},
  setWorking() {},
  setError() {},
  setLastResult() {},
  reset() {},
});

export default LinkerContext;

export const Provider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<Error>(null);
  const [lastResult, setLastResult] = useState<{ recipe: any; problems: any }>(
    null,
  );

  const reset = () => {
    setError(null);
    setWorking(false);
    setLastResult(null);
    setOpen(false);
  };

  return (
    <LinkerContext.Provider
      value={{
        open,
        working,
        error,
        lastResult,
        setOpen,
        setWorking,
        setError,
        setLastResult,
        reset,
      }}
    >
      {children}
    </LinkerContext.Provider>
  );
};

export const Consumer = LinkerContext.Consumer;
