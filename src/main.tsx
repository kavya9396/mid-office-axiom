import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'
import { initializeErrorMessages } from './config/errorMessages'

const theme = createTheme({
  typography: {
    fontFamily: "'Mulish', sans-serif",
  },
});

const renderApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </StrictMode>,
  )
}

void initializeErrorMessages().finally(renderApp)
