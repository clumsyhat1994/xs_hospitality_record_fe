import { createContext, useContext } from "react";
console.log("FormModeContext LOADED");
const FormModeContext = createContext({ isEditMode: null });

export function FormModeProvider({ isEditMode, children }) {
  return (
    <FormModeContext.Provider value={{ isEditMode }}>
      {children}
    </FormModeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFormMode() {
  return useContext(FormModeContext);
}
