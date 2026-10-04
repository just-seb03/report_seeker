/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : InfoReport.tsx                                                *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                           *
 *                                                                                             *
 *          Fecha de Inicio : 01 de Octubre de 2026                                         *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026 [SA]                                    *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   InfoReport -- Componente contenedor de la visualización de un reporte individual.         *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { Box, Dialog, IconButton, Typography, alpha } from '@mui/material';
import { type IssueReport } from '../database';
import { useInfoReport, formatReportDate } from '../control/useInfoReport';

type InfoReportProps = {
  report: IssueReport;
  onBack: () => void;
};

export default function InfoReport({ report, onBack }: InfoReportProps) {
  const {
    image,
    isLoadingImage,
    isOpeningImage,
    imageDialogOpen,
    priorityClass,
    setImageDialogOpen,
    handleOpenFullImage,
  } = useInfoReport(report);

  const getSeverityPalette = (priorityClass: string) => {
    switch(priorityClass) {
      case 'is-low': return 'success';
      case 'is-medium': return 'warning';
      case 'is-high': return 'error';
      default: return 'primary';
    }
  };
  const severityPalette = getSeverityPalette(priorityClass || '');

  return (
    <Box 
      component="main" 
      sx={{
        position: 'absolute', inset: 0, zIndex: 5, overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box',
        p: 'max(12px, env(safe-area-inset-top)) 18px calc(110px + env(safe-area-inset-bottom))',
        bgcolor: 'background.default', color: 'text.primary', WebkitOverflowScrolling: 'touch',
        '@media (max-width: 480px)': { px: '14px' }
      }}
    >
      <Box component="header" sx={{ display: 'flex', minHeight: 64, alignItems: 'center', gap: 2, mx: 'auto', mb: 3, maxWidth: 560 }}>
        <IconButton 
          aria-label="Volver" 
          onClick={onBack}
          sx={{ 
            width: 48, height: 48, flex: '0 0 auto',
            bgcolor: 'transparent', color: 'text.primary',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ display: 'grid', minWidth: 0, gap: '2px', color: 'inherit' }}>
          <Typography component="span" sx={{ color: 'primary.main', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reporte de riesgo</Typography>
          <Typography component="h1" sx={{ m: 0, overflowWrap: 'anywhere', fontSize: '24px', fontWeight: 700, lineHeight: 1.2 }}>{report.title}</Typography>
        </Box>
      </Box>

      <Box sx={{ width: 'min(100%, 560px)', mx: 'auto', animation: 'info-report-enter 440ms cubic-bezier(0.2, 0.8, 0.2, 1) both' }}>
        <Box
          component="button"
          type="button"
          onClick={handleOpenFullImage}
          disabled={!image || isOpeningImage}
          aria-label="Abrir fotografía completa"
          aria-busy={isLoadingImage || isOpeningImage}
          sx={{
            position: 'relative', display: 'grid', width: '100%', height: 'min(55dvh, 520px)', minHeight: 220, placeItems: 'center', p: 0, overflow: 'hidden',
            borderRadius: '24px', 
            bgcolor: isLoadingImage ? 'transparent' : 'background.paper', color: 'text.secondary', font: 'inherit', cursor: 'zoom-in',
            boxShadow: '0 4px 12px rgb(0 0 0 / 5%)',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '@media (max-width: 480px)': { height: 'min(54dvh, 440px)' },
            '&:disabled': { cursor: 'default' },
            '&:not(:disabled):active': { transform: 'scale(0.99)', boxShadow: '0 2px 6px rgb(0 0 0 / 8%)' },
            ...(isLoadingImage && {
              background: 'linear-gradient(100deg, #eeeeee 20%, #f7f7f7 38%, #eeeeee 58%)',
              backgroundSize: '220% 100%', animation: 'info-report-shimmer 1.4s linear infinite'
            })
          }}
        >
          {image ? (
            <Box component="img" src={image} alt={`Fotografía del riesgo: ${report.title}`} sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', animation: 'info-report-photo-enter 500ms cubic-bezier(0.2, 0.8, 0.2, 1) both' }} />
          ) : (
            <Typography component="span" sx={{ p: 2.5, fontSize: '13px', fontWeight: 600 }}>
              {isLoadingImage ? 'Cargando fotografía...' : 'Este reporte no tiene fotografía'}
            </Typography>
          )}
        </Box>

        <Box component="section" aria-label="Información del reporte" sx={{ display: 'grid', gap: 2, mt: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.72fr)', gap: 1.5 }}>
            <Box sx={{ display: 'flex', minWidth: 0, minHeight: 88, alignItems: 'center', gap: 2, p: 2, borderRadius: '24px', bgcolor: 'background.paper', boxShadow: '0 2px 8px rgb(0 0 0 / 4%)' }}>
              <Box sx={{ display: 'grid', width: 48, height: 48, flex: '0 0 48px', placeItems: 'center', borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12), color: 'primary.main' }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box sx={{ display: 'grid', minWidth: 0, gap: 0.5 }}>
                <Typography component="h3" sx={{ m: 0, color: 'text.secondary', fontSize: '12px', fontWeight: 600 }}>Ubicación</Typography>
                <Typography component="p" sx={{ m: 0, color: 'text.primary', fontSize: '14px', fontWeight: 500, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{report.location || 'No especificada'}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', minWidth: 0, minHeight: 88, alignItems: 'center', gap: 2, p: 2, borderRadius: '24px', bgcolor: 'background.paper', boxShadow: '0 2px 8px rgb(0 0 0 / 4%)' }}>
              <Box sx={{ display: 'grid', width: 48, height: 48, flex: '0 0 48px', placeItems: 'center', borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette[severityPalette as 'primary'|'success'|'warning'|'error'].main, 0.12), color: `${severityPalette}.main` }}>
                <PriorityHighRoundedIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box sx={{ display: 'grid', minWidth: 0, gap: 0.5 }}>
                <Typography component="h3" sx={{ m: 0, color: 'text.secondary', fontSize: '12px', fontWeight: 600 }}>Gravedad</Typography>
                <Typography component="p" sx={{ m: 0, color: `${severityPalette}.main`, fontSize: '14px', fontWeight: 600, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{report.priority}</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ p: 2.5, borderRadius: '24px', bgcolor: 'background.paper', boxShadow: '0 2px 8px rgb(0 0 0 / 4%)' }}>
            <Typography component="h2" sx={{ m: 0, mb: 1, color: 'primary.main', fontSize: '13px', fontWeight: 600, letterSpacing: '0.2px' }}>Descripción</Typography>
            <Typography component="p" sx={{ m: 0, color: 'text.primary', fontSize: '15px', fontWeight: 400, lineHeight: 1.6, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{report.description || 'Sin descripción'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, p: '8px 4px', color: 'text.secondary', fontSize: '13px', fontWeight: 500, '& > span': { display: 'inline-flex', minWidth: 0, alignItems: 'center', gap: 1 }, '& svg': { flex: '0 0 auto', fontSize: 18 } }}>
            <span><AccountCircleOutlinedIcon aria-hidden="true" /> {report.workerName || 'Trabajador Desconocido'}</span>
            <span><CalendarMonthOutlinedIcon aria-hidden="true" /> {formatReportDate(report.capturedAt)}</span>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        fullScreen
        aria-label="Fotografía completa del reporte"

      >
        <Box sx={{ position: 'relative', display: 'grid', width: '100%', height: '100%', placeItems: 'center', bgcolor: '#000000' }} onClick={() => setImageDialogOpen(false)}>
          <IconButton 
            aria-label="Cerrar fotografía"
            sx={{ position: 'absolute', zIndex: 1, top: 'max(12px, env(safe-area-inset-top))', left: 12, color: '#ffffff', bgcolor: 'rgb(255 255 255 / 16%)', '&:hover': { bgcolor: 'rgb(255 255 255 / 24%)' } }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          {image && <Box component="img" src={image} alt={`Fotografía completa: ${report.title}`} sx={{ display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
        </Box>
      </Dialog>
    </Box>
  );
}
