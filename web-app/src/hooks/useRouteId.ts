"use client";

import { useEffect, useState } from "react";

/**
 * Extract the real dynamic route ID from the browser URL pathname.
 *
 * In a Next.js static export with `generateStaticParams` returning a placeholder
 * (`{ id: "_" }`), `useParams()` returns the build-time placeholder instead of
 * the actual URL segment. This hook reads `window.location.pathname` directly
 * so it always returns the real value.
 *
 * @param segmentIndex - The zero-based index of the path segment to extract.
 *   For `/hotels/123` → segmentIndex 1 returns "123".
 *   For `/admin/hotels/abc` → segmentIndex 2 returns "abc".
 *   Defaults to -1 which means "last segment".
 */
export function useRouteId(segmentIndex = -1): string {
  const [id, setId] = useState("");

  useEffect(() => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const idx = segmentIndex < 0 ? segments.length - 1 : segmentIndex;
    const value = segments[idx] || "";
    setId(decodeURIComponent(value));
  }, [segmentIndex]);

  return id;
}
