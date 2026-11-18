"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { BlockNoteEditor } from "@blocknote/core";

type EditorsContextValue = {
  docEditor: BlockNoteEditor | null;
  setDocEditor: (editor: BlockNoteEditor | null) => void;
};

const EditorsContext = createContext<EditorsContextValue | null>(null);

/**
 * Shares the live editors with UI outside their panels (the agent panel drives them, the share
 * dialog exports them). An editor is null while its panel isn't mounted, e.g. in Canvas-only view.
 */
export function WorkspaceEditorsProvider({ children }: { children: ReactNode }) {
  const [docEditor, setDocEditor] = useState<BlockNoteEditor | null>(null);
  return <EditorsContext.Provider value={{ docEditor, setDocEditor }}>{children}</EditorsContext.Provider>;
}

export function useWorkspaceEditors() {
  const value = useContext(EditorsContext);
  if (!value) throw new Error("useWorkspaceEditors must be used inside <WorkspaceEditorsProvider>");
  return value;
}
