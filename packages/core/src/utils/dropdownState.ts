let lastOpenedDropdown: string | null = null;

export const getLastOpenedDropdown = (): string | null => lastOpenedDropdown;
export const setLastOpenedDropdown = (id: string | null): void => {
  lastOpenedDropdown = id;
};
export const clearLastOpenedDropdown = (): void => {
  lastOpenedDropdown = null;
};
