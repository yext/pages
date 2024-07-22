import * as React from "react";

const DocumentContext = React.createContext<any | undefined>(undefined);

type DocumentProviderProps<T> = {
  value: T;
  children: React.ReactNode;
};

const DocumentProvider = <T,>({
  value,
  children,
}: DocumentProviderProps<T>) => {
  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

const useDocument = <T,>(): T => {
  const context = React.useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }

  return context as T;
};

export { DocumentProvider, useDocument };
