// validation.ts
export const VALIDATIONS = {
  username: {
    required: "Username is required",
    pattern: {
      value: /^[a-zA-Z0-9]+$/,
      message: "Only alphanumeric characters allowed",
    },
  },

  password: {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Minimum 8 characters required",
    },
  },
};