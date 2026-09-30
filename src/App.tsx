import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from './pages/Home';

// Importación local para que funcione en la mina
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#111111',
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h3: {
      fontWeight: 800, // Extragrueso como el título de la imagen
      letterSpacing: '-0.04em', // Aprieta las letras entre sí
      lineHeight: 1.1, // Aprieta el espacio vertical entre las líneas
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Home />
    </ThemeProvider>
  );
}

export default App;