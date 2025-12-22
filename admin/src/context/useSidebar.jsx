// useSidebar.js
import { useContext } from 'react';
import { SidebarContext } from './sidebarContext'; // Mengimpor SidebarContext dari file SidebarContext.js

// Hook untuk menggunakan SidebarContext
export const useSidebar = () => {
  return useContext(SidebarContext);
};
