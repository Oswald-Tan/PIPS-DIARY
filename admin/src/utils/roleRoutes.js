export const roleRoutes = {
  admin: "/dashboard",
};

export const getDashboardPathByRole = (role) => roleRoutes[role] || "/";
