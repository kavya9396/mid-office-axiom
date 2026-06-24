export const auth = {
  isAuthenticated: () =>
    !!localStorage.getItem("token"),

  login: (token: string) =>
    localStorage.setItem("token", token),

  logout: () =>{
    localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("column_config_v1");
  localStorage.removeItem("roleType");
  }
  
};