// App.jsx (Corrected if LoginForm passes username and password)
import React, { useState } from 'react'; // No need for useEffect in MainContent
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import MainButton from './components/MainButton';
import AboutUs from './components/AboutUs';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ForgotPassword from './components/ForgotPassword';
import FatFitPage from './components/FitFatPage';
import WorkoutMain from './components/Workout/WorkoutMain';
import MealsMain from './components/Food/MealsMain'; // Ensure MealsMain is used
import RecipesMain from './components/Recipes/RecipesMain'; // Ensure RecipesMain is used
import './App.css';

function MainContent() {
  const [view, setView] = useState('main');
  const navigate = useNavigate();

  const handleAboutUsClick = () => setView('aboutUs');
  const handleBackClick = () => setView('main');
  const handleOpenLogin = () => setView('login');

  const handleLoginSubmit = (loggedInUsername) => {
    console.log(`Logged in as ${loggedInUsername}`);
    localStorage.setItem("username", loggedInUsername);
    setView('main'); // Reset view to main (optional, for safety)
    navigate(`/fatfit/${loggedInUsername}`); // Go to FatFitPage after login
  };

  return (
    <div className="TheRealMain">
      <Header onAboutUsClick={handleAboutUsClick} />
      <main>
        {view === 'main' && <MainButton onOpenLogin={handleOpenLogin} />}
        {view === 'aboutUs' && <AboutUs onBackClick={handleBackClick} />}
        {view === 'login' && (
          <LoginForm
            onSignUpClick={() => setView('register')}
            onResetPasswordClick={() => setView('forgotPassword')}
            onSubmit={handleLoginSubmit}
          />
        )}
        {view === 'register' && <RegisterForm onBackClick={handleBackClick} />}
        {view === 'forgotPassword' && <ForgotPassword onBackClick={handleBackClick} />}
      </main>
      <footer></footer>
    </div>
  );
}

// ProtectedRoute component
function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem("username");
  const location = useLocation();

  // Prevent infinite redirect loop
  if (!isAuthenticated) {
    if (location.pathname !== "/") {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    // If already on "/", just render children (login page)
    return children;
  }

  // If authenticated and on "/", redirect to user's FatFitPage
  if (location.pathname === "/") {
    const username = localStorage.getItem("username");
    return <Navigate to={`/fatfit/${username}`} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainContent />
            </ProtectedRoute>
          }
        />
        {/* Protect FatFitPage and its nested routes */}
        <Route
          path="/fatfit/:username/*"
          element={
            <ProtectedRoute>
              <FatFitPage />
            </ProtectedRoute>
          }
        >
          <Route path="workout" element={<WorkoutMain />} />
          <Route path="meals" element={<MealsMain />} />
          <Route path="recipes" element={<RecipesMain />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;