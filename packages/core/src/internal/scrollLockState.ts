export const resetScrollLockTestState = () => {
  document.body.innerHTML = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  document.documentElement.style.overflow = "";

  document.body.childNodes.forEach((node) => {
    if (node instanceof HTMLElement) {
      node.inert = false;
    }
  });
};
