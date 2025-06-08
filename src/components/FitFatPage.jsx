import React, { useEffect, useState } from 'react';
import './FitFatPage.css';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import CalorieCounter from './FatFit-Main/CalorieCounter';
import ForYouRecipes from '../components/recursive/ForYouRecipes';

const API_URL = import.meta.env.VITE_API_URL;

const FitFatPage = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const location = useLocation();

  const [showCalorieCounter, setShowCalorieCounter] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [showForYouRecipes, setShowForYouRecipes] = useState(false);
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    if (username) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          setError(null);
          setUserData(null);

          let response;
          try {
            response = await fetch(`${API_URL}/fatfit/${username}`, { signal });
          } catch (fetchErr) {
            if (fetchErr.name === "AbortError") {
              // This is normal in React StrictMode/dev, just log and return
              console.log("Fetch aborted (not an error):", fetchErr.message);
              return;
            }
            console.error("Fetch error in FitFatPage:", fetchErr);
            setError("Could not connect to backend. Please check your server or network.");
            setLoading(false);
            return;
          }

          if (signal.aborted) {
            console.log("Fetch for user data was aborted (Strict Mode or component unmount).");
            return;
          }

          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorBody.message || 'Failed to fetch user data');
          }

          const data = await response.json();
          setUserData(data);
          setLoading(false);
        } catch (err) {
          if (err.name === 'AbortError') {
            // This is normal in React 18 dev mode (StrictMode double invoke)
            console.log('Fetch aborted (not an error):', err.message);
          } else {
            console.error("Error fetching user data in FitFatPage:", err);
            setError(err.message || "Failed to fetch user data.");
          }
          setLoading(false);
        }
      };
      fetchUserData();
    } else {
      setError("Username is missing from the URL. Please log in.");
      setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [username, navigate]);

  useEffect(() => {
    // Hide CalorieCounter if on a subroute, show if on main
    const isMainRoute =
      location.pathname === `/fatfit/${username}` ||
      location.pathname === `/fatfit/${username}/`;

    setShowCalorieCounter(isMainRoute);

    // If user refreshes or navigates to an unknown subroute, redirect to main calorie tracker
    if (
      !isMainRoute &&
      ![
        `/fatfit/${username}/workout`,
        `/fatfit/${username}/meals`,
        `/fatfit/${username}/recipes`,
        `/fatfit/${username}/for-you`
      ].includes(location.pathname)
    ) {
      navigate(`/fatfit/${username}`, { replace: true });
    }
  }, [location.pathname, username, navigate]);

  const goToRoute = (route) => {
    if (route === '/for-you') {
      setShowForYouRecipes(true);
      setShowCalorieCounter(false);
    } else {
      setShowForYouRecipes(false);
      navigate(`/fatfit/${username}${route}`);
      setShowCalorieCounter(false);
    }
  };

  const returnCalorieCounter = () => {
    setShowForYouRecipes(false);
    navigate(`/fatfit/${username}`);
    setShowCalorieCounter(true);
  };

  const handleOpenUserModal = () => {
    setNewUsername(userData.user.username);
    setModalError("");
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setModalError("");
    setModalLoading(false);
  };

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handleUpdateUsername = async () => {
    setModalLoading(true);
    setModalError("");
    try {
      const response = await fetch(`${API_URL}/user/${userData.user.username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update username");
      }
      // Success: update userData in state with new username
      setUserData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          username: newUsername,
          fullname: prev.user.fullname === prev.user.username ? newUsername : prev.user.fullname
        },
      }));
      handleCloseUserModal();
      navigate(`/fatfit/${newUsername}`, { replace: true });
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setModalLoading(true);
    setModalError("");
    try {
      const response = await fetch(`${API_URL}/user/${userData.user.username}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account");
      }
      // Success: logout and redirect to home
      handleCloseUserModal();
      navigate("/");
      window.location.reload();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

 

  if (loading) {
    return <div className="fatfit-container">Loading user data...</div>;
  }

  if (error) {
    return <div className="fatfit-container">Error: {error}</div>;
  }

  if (!userData) {
    return <div className="fatfit-container">No user data available.</div>;
  }

  const dailyTarget = userData.dailyCalorieTarget;
  const userGoal = userData.goal; // Get 'goal' exactly as it is from backend
  

  return (
    <div className="fatfit-container">
      <div className="head">
        <img className="logo" src="/assets/LOGOwitoutBackgorund.png" alt="logo" />
        <div className="header_right">
          {/* Username button opens modal */}
          <button className="user" onClick={handleOpenUserModal}>
            Hello, {userData.user.username || username}!
          </button>
          <button className="logout" onClick={() => {
            localStorage.removeItem("username");
            localStorage.removeItem("token");
            navigate('/');
          }}>Logout</button>
        </div>
      </div>
      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" style={{
          position: "fixed",
          zIndex: 9998,
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(2px)"
        }}>
          <div className="modal" style={{
            position: "relative",
            zIndex: 9999,
            background: "#fff",
            borderRadius: 12,
            padding: 32,
            margin: "auto",
            minWidth: 320,
            minHeight: 180,
            boxShadow: "0 4px 24px #0002"
          }}>
            <h3>Edit Username or Delete Account</h3>
            <label>
              New Username:
              <input
                type="text"
                value={newUsername}
                onChange={handleUsernameChange}
                disabled={modalLoading}
                style={{ marginLeft: 8 }}
              />
            </label>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={handleUpdateUsername} disabled={modalLoading || !newUsername}>
                Save
              </button>
              <button onClick={handleDeleteAccount} disabled={modalLoading} style={{ color: "red" }}>
                Delete Account
              </button>
              <button onClick={handleCloseUserModal} disabled={modalLoading}>
                Cancel
              </button>
            </div>
            {modalError && <div style={{ color: "red", marginTop: 8 }}>{modalError}</div>}
          </div>
        </div>
      )}
      <div className="navigation">
        <button className="button" onClick={() => goToRoute('/workout')}>Workout</button>
        <button className="button" onClick={() => goToRoute('/meals')}>Food</button>
        <button className="button" onClick={() => goToRoute('/recipes')}>Recipes</button>
        <button className="button" onClick={() => goToRoute('/for-you')}>Your Recipes</button>
        <button className="button" onClick={returnCalorieCounter}>Home</button>
      </div>
      <div className="main_fatfit">
        {showForYouRecipes ? (
          <ForYouRecipes username={username} />
        ) : (
          <>
            {showCalorieCounter && (
              <CalorieCounter
                username={username}
                initialCalories={dailyTarget}
                userGoal={userGoal}
              />
            )}
            {/* Pass username to MealsPage via Outlet context */}
            <Outlet context={{ username }} />
          </>
        )}
      </div>
    </div>
  );
};

export default FitFatPage;