export const isNil = (value: any): boolean => {
  return (
    value === null || value === undefined || Object.keys(value).length === 0
  );
};
