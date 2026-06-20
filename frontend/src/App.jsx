import Router from './app/router';
import { AuthProvider } from './context/AuthContext.jsx';
import './styles/index.css';

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
