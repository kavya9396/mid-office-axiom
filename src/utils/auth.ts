export const auth = {
  isAuthenticated: () =>
    !!localStorage.getItem("token"),

  login: (token: string) =>
    localStorage.setItem("token", token),

  logout: (preserveRemember = true) => {
    // preserve remember_data/remember_me when requested
    const rememberData = localStorage.getItem("remember_data");
    const rememberMe = localStorage.getItem("remember_me");

    localStorage.clear();
    sessionStorage.clear();

    if (preserveRemember && rememberMe === "true" && rememberData) {
      localStorage.setItem("remember_data", rememberData);
      localStorage.setItem("remember_me", "true");
    }
  },
  
};