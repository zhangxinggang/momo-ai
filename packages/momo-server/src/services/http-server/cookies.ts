const getCookies = () => {
  const projectName = (NKGlobal.config.project || {}).name || 'nk';
  const cookies = {
    token: `${projectName}-access-token`,
  };
  return cookies;
};

export { getCookies };
