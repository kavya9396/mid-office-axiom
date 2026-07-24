export const auth = {
  isAuthenticated: () =>
    !!localStorage.getItem("token"),

  login: (token: string) =>
    localStorage.setItem("token", token),

  logout: () => {
    localStorage.clear();
    sessionStorage.clear();
  }
  
};