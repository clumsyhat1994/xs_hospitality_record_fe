export const FORM_VALIDATION_BLOCKED_HINT =
  "表单存在错误，请滚动查看标红的字段。";

/** Flatten react-hook-form errors into dot-notation field paths. */
export function collectErrorFieldPaths(errors, prefix = "") {
  if (!errors || typeof errors !== "object") return [];
  const paths = [];
  for (const [key, value] of Object.entries(errors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value?.message) {
      paths.push(path);
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        paths.push(...collectErrorFieldPaths(item, `${path}.${index}`));
      });
      continue;
    }
    if (value && typeof value === "object") {
      paths.push(...collectErrorFieldPaths(value, path));
    }
  }
  return paths;
}

function getActiveDialogContent() {
  const dialogs = document.querySelectorAll(
    '[role="dialog"]:not([aria-hidden="true"])',
  );
  const topDialog = dialogs[dialogs.length - 1];
  return topDialog?.querySelector(".MuiDialogContent-root") ?? null;
}

function scrollElementIntoView(el) {
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  if (typeof el.focus === "function") {
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
  }
}

/** Scroll the open dialog to the first field (or block) with a validation error. */
export function scrollToFirstFormError(errors, scope = getActiveDialogContent()) {
  if (!scope || !errors) return;

  for (const path of collectErrorFieldPaths(errors)) {
    const byName = scope.querySelector(`[name="${CSS.escape(path)}"]`);
    if (byName) {
      scrollElementIntoView(byName);
      return;
    }
  }

  if (errors?.giftReceiptLines?.message) {
    const giftLinesError = scope.querySelector("#gift-receipt-lines-error");
    if (giftLinesError) {
      scrollElementIntoView(giftLinesError);
      return;
    }
  }

  const firstErrorInput = scope.querySelector(
    ".Mui-error input, .Mui-error textarea, .Mui-error [role='combobox']",
  );
  if (firstErrorInput) {
    scrollElementIntoView(firstErrorInput);
  }
}

export function notifyFormValidationBlocked(errors, setHint) {
  setHint(FORM_VALIDATION_BLOCKED_HINT);
  scrollToFirstFormError(errors);
}
