/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : BottomNav.tsx                                                 *
 *                                                                                             *
 *              Programador : Sebastian Arredondo, Maximiliano Cantuarias                   *
 *                                                                                             *
 *          Fecha de Inicio : 29 de Septiembre de 2026                                      *
 *                                                                                             *
 *     Última Actualización : 02 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   BottomNav -- Renderiza la barra de navegación inferior de la aplicación.                  *
 *   handleHomeClick -- Navega hacia la pantalla de inicio principal.                          *
 *   handleReportClick -- Inicia el flujo de creación de un nuevo reporte fotográfico.         *
 *   handleProfileClick -- Navega hacia la pantalla del perfil del usuario.                    *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';

type BottomNavProps = {
  activeView: 'home' | 'report' | 'profile' | 'cola' | 'seekie';
  onHomeClick?: () => void;
  onReportClick?: () => void;
  onProfileClick?: () => void;
  onColaClick?: () => void;
  onSeekieClick?: () => void;
};

export default function BottomNav({ activeView, onHomeClick, onReportClick, onProfileClick, onColaClick, onSeekieClick }: BottomNavProps) {
  
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    switch (newValue) {
      case 'report': onReportClick?.(); break;
      case 'cola': onColaClick?.(); break;
      case 'home': onHomeClick?.(); break;
      case 'seekie': onSeekieClick?.(); break;
      case 'profile': onProfileClick?.(); break;
    }
  };

  return (
    <Paper 
      elevation={8} 
      sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden'
      }}
    >
      <BottomNavigation
        value={activeView}
        onChange={handleChange}
        showLabels
        sx={{
          height: 80,
          backgroundColor: 'background.paper',
          paddingBottom: '16px',
          alignItems: 'flex-end',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '12px 0 8px 0',
            color: 'text.secondary',
          },
          '& .Mui-selected': {
            color: 'primary.main',
            '& .MuiBottomNavigationAction-label': {
              fontWeight: 700,
            }
          },
          '& .MuiBottomNavigationAction-label': {
            marginTop: '4px',
          },
          '& .MuiSvgIcon-root': {
             transition: 'background-color 0.2s, color 0.2s',
             padding: '4px 16px',
             borderRadius: '16px',
             boxSizing: 'content-box',
             marginBottom: '4px',
          },
          '& .Mui-selected .MuiSvgIcon-root': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
          }
        }}
      >
        <BottomNavigationAction label="Reportar" value="report" icon={<AssignmentOutlinedIcon />} />
        <BottomNavigationAction label="Cola" value="cola" icon={<AccessTimeOutlinedIcon />} />
        <BottomNavigationAction label="Inicio" value="home" icon={<HomeIcon />} />
        <BottomNavigationAction label="Seekie AI" value="seekie" icon={<ChatOutlinedIcon />} />
        <BottomNavigationAction label="Perfil" value="profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
