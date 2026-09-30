// src/App.tsx
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from './pages/Home';

// Definimos la paleta estricta monocromática
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Negro puro para elementos principales
    },
    background: {
      default: '#f5f5f5', // Un gris muy claro de fondo para que la píldora blanca resalte
      paper: '#ffffff',
    },
    text: {
      primary: '#111111',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, Roboto, Arial, sans-serif',
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline aplica el color de fondo y resetea márgenes automáticamente */}
      <CssBaseline />
      <Home />
    </ThemeProvider>
  );
}

export default App;