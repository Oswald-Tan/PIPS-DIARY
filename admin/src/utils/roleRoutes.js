export const roleRoutes = {
  super_admin: "/dashboard",
  admin: "/dashboard",
};

export const getDashboardPathByRole = (role) => roleRoutes[role] || "/";
