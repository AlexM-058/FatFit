// App.jsx (Corrected if LoginForm passes username and password)
import React, { useState } from 'react'; // No need for useEffect in MainContent
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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

  // Corrected handleLoginSubmit: It should receive the username string
  // If your LoginForm's onSubmit actually passes the full 'user' object,
  // then change the parameter from 'username' to 'userData' and use 'userData.username'
  const handleLoginSubmit = (loggedInUsername) => { // Expecting a string here
    console.log(`Logged in as ${loggedInUsername}`);
    navigate(`/fatfit/${loggedInUsername}`); // Use the string directly
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
            onSubmit={handleLoginSubmit} // This onSubmit needs to ensure it passes the username string
          />
        )}
        {view === 'register' && <RegisterForm onBackClick={handleBackClick} />}
        {view === 'forgotPassword' && <ForgotPassword onBackClick={handleBackClick} />}
      </main>
      <footer></footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainContent />} />
        {/* Make sure the FatFitPage route has the :username parameter and /* for nested routes */}
        <Route path="/fatfit/:username/*" element={<FatFitPage />} > {/* Add /* for nested routes */}
          <Route path="workout" element={<WorkoutMain />} />
          <Route path="meals" element={<MealsMain />} />
          <Route path="recipes" element={<RecipesMain />} /> {/* Render RecipesMain component */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;