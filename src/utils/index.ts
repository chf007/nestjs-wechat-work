export const getPathById = (id: any, data: any): any[] => {
  const tmp = [];
  for (const item of data) {
    if (item.id === id) {
      tmp.unshift(item);
      if (item.parentid) {
        tmp.unshift(getPathById(item.parentid, data));
      }
    }
  }
  return tmp;
};

export const flatten = (arr: any[]): any[] => {
  return arr.reduce((pre, cur) => {
    if (!Array.isArray(cur)) {
      return [...pre, cur];
    } else {
      return [...pre, ...flatten(cur)];
    }
  }, []);
};
