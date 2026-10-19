import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {EvaluationPage} from './research/EvaluationPage';
import '@fontsource-variable/noto-sans-kr';
import './styles.css';
import './research/research.css';
createRoot(document.getElementById('root')!).render(<StrictMode>{new URLSearchParams(location.search).has('evaluation')?<EvaluationPage/>:<App/>}</StrictMode>);
