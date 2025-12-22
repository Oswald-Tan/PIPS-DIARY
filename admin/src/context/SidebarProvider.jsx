import { useState } from 'react';
import PropTypes from 'prop-types'; // Impor PropTypes
import { SidebarContext } from './sidebarContext'; // Mengimpor SidebarContext

// Provider untuk menyediakan context ini ke komponen-komponen lainnya
export const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(false); // Sidebar dimulai dengan status tertutup

  const toggleSidebar = () => {
    setOpen((prevState) => !prevState); // Menukar status visibilitas sidebar
  };

  return (
    <SidebarContext.Provider value={{ open, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Menambahkan validasi props 'children'
SidebarProvider.propTypes = {
  children: PropTypes.node.isRequired, // Validasi agar children bukan null atau undefined
};
