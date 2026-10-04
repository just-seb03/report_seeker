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
      <Box component="header" sx={{ display: 'flex', minHeight: 58, alignItems: 'center', gap: 1.5, mx: 'auto', mb: 2, maxWidth: 560 }}>
        <IconButton 
          aria-label="Volver" 
          onClick={onBack}
          sx={{ 
            width: 44, height: 44, flex: '0 0 auto', border: '1px solid', borderColor: 'divider', 
            bgcolor: 'background.paper', color: 'text.primary', boxShadow: '0 2px 8px rgb(0 0 0 / 6%)',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ display: 'grid', minWidth: 0, gap: '3px', color: 'inherit' }}>
          <Typography component="span" sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Reporte de riesgo</Typography>
          <Typography component="h1" sx={{ m: 0, overflowWrap: 'anywhere', fontSize: '21px', fontWeight: 800, lineHeight: 1.2 }}>{report.title}</Typography>
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
            border: '1px solid', borderColor: 'divider', borderRadius: '10px', 
            bgcolor: isLoadingImage ? 'transparent' : 'action.selected', color: 'text.secondary', font: 'inherit', cursor: 'zoom-in',
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 8px 22px rgb(0 0 0 / 24%)' : '0 8px 22px rgb(0 0 0 / 8%)',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
            '@media (max-width: 480px)': { height: 'min(54dvh, 440px)' },
            '&:disabled': { cursor: 'default' },
            '&:not(:disabled):active': { transform: 'scale(0.99)', boxShadow: (theme) => theme.palette.mode === 'dark' ? 'none' : '0 3px 10px rgb(0 0 0 / 10%)' },
            ...(isLoadingImage && {
              background: (theme) => theme.palette.mode === 'dark' ? 'linear-gradient(100deg, #202020 20%, #303030 38%, #202020 58%)' : 'linear-gradient(100deg, #eeeeee 20%, #f7f7f7 38%, #eeeeee 58%)',
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

        <Box component="section" aria-label="Información del reporte" sx={{ display: 'grid', gap: 1.5, mt: 2.25 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.72fr)', gap: 1.25 }}>
            <Box sx={{ display: 'flex', minWidth: 0, minHeight: 80, alignItems: 'center', gap: 1.4, p: 1.6, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'grid', width: 38, height: 38, flex: '0 0 38px', placeItems: 'center', borderRadius: '50%', bgcolor: 'grey.300', color: 'grey.600' }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box sx={{ display: 'grid', minWidth: 0, gap: 0.5 }}>
                <Typography component="h3" sx={{ m: 0, color: 'text.secondary', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Ubicación</Typography>
                <Typography component="p" sx={{ m: 0, color: 'text.primary', fontSize: '13px', fontWeight: 600, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{report.location || 'Ubicación no especificada'}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', minWidth: 0, minHeight: 80, alignItems: 'center', gap: 1.4, p: 1.6, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'grid', width: 38, height: 38, flex: '0 0 38px', placeItems: 'center', borderRadius: '50%', bgcolor: (theme) => alpha(theme.palette[severityPalette as 'primary'|'success'|'warning'|'error'].main, 0.12), color: `${severityPalette}.main` }}>
                <PriorityHighRoundedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box sx={{ display: 'grid', minWidth: 0, gap: 0.5 }}>
                <Typography component="h3" sx={{ m: 0, color: 'text.secondary', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Gravedad</Typography>
                <Typography component="p" sx={{ m: 0, color: `${severityPalette}.main`, fontSize: '13px', fontWeight: 600, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{report.priority}</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', boxShadow: '0 2px 8px rgb(0 0 0 / 4%)' }}>
            <Typography component="h2" sx={{ m: 0, mb: 1, color: 'text.secondary', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>Descripción</Typography>
            <Typography component="p" sx={{ m: 0, color: 'text.primary', fontSize: '14px', fontWeight: 500, lineHeight: 1.6, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{report.description || 'Sin descripción'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.5, p: '3px 2px 8px', color: 'text.secondary', fontSize: '11px', '& > span': { display: 'inline-flex', minWidth: 0, alignItems: 'center', gap: 0.75 }, '& svg': { flex: '0 0 auto', fontSize: 15 } }}>
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
