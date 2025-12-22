// SidebarContext.js
import { createContext } from 'react';

// Membuat Context untuk Sidebar
export const SidebarContext = createContext({
  open: false, // Sidebar dimulai dengan status tertutup
  toggleSidebar: () => {}, // Fungsi untuk toggle sidebar, akan diperbarui nanti
});
