import { useEffect } from "react";

/** Sets the tab/app title for a page, restoring nothing (routes always set it). */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Jack's Realty` : "Jack's Realty";
  }, [title]);
}
