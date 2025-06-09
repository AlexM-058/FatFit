import React, { useEffect, useState } from 'react';
import './FitFatPage.css';
import { Outlet, useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import CalorieCounter from './FatFit-Main/CalorieCounter';
import ForYouRecipes from './recursive/ForYouRecipes'; 

const API_URL = import.meta.env.VITE_API_URL;

const FitFatPage = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const location = useLocation();

  const [showCalorieCounter, setShowCalorieCounter] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [showForYouRecipes, setShowForYouRecipes] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Get the logged-in username from localStorage
    const loggedInUsername = localStorage.getItem("username");

    // If someone tries to access /fatfit/:username with a different username, redirect to their own page
    if (username && loggedInUsername && username !== loggedInUsername) {
      navigate(`/fatfit/${loggedInUsername}`, { replace: true });
      return;
    }

    if (username) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          setUserData(null);

          let response;
          try {
            // Log cookies before making the request
            console.log("Current cookies before fetch:", document.cookie);

            response = await fetch(`${API_URL}/fatfit/${username}`, {
              signal,
              credentials: "include" // Use cookies for auth
            });

            // Log response status for debugging
            console.log("Fetch /fatfit/:username response status:", response.status);

          } catch (fetchErr) {
            if (fetchErr.name === "AbortError") {
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

          if (response.status === 401) {
            console.warn("401 Unauthorized: JWT cookie missing or invalid. Cookies:", document.cookie);
            localStorage.removeItem("username");
            setError("Session expired or unauthorized. Please log in again.");
            setLoading(false);
            navigate("/", { replace: true });
            return;
          }

          const data = await response.json();
          console.log("userData from backend:", data);
          // If backend returns {data: 'Protected content'}, treat as unauthorized
          if (data && data.data === 'Protected content') {
            setError("Session expired or unauthorized. Please log in again.");
            setLoading(false);
            navigate("/", { replace: true });
            return;
          }
          setUserData(data);
          setLoading(false);
        } catch (err) {
          if (err.name === 'AbortError') {
            console.log('Fetch aborted (not an error):', err.message);
            return;
          }
          setError(err.message || "Failed to fetch user data.");
          setLoading(false);
        }
      };
      fetchUserData();
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
      navigate(`/fatfit/${username}/for-you`, { replace: false });
    } else if (route === '/workout' || route === '/meals' || route === '/recipes') {
      setShowForYouRecipes(false);
      setShowCalorieCounter(false);
      navigate(`/fatfit/${username}${route}`, { replace: false });
    } else {
      setShowForYouRecipes(false);
      setShowCalorieCounter(true);
      navigate(`/fatfit/${username}`, { replace: false });
    }
  };

  const returnCalorieCounter = () => {
    setShowForYouRecipes(false);
    navigate(`/fatfit/${username}`);
    setShowCalorieCounter(true);
  };

  const handleOpenUserModal = () => {
    // Protect against userData or userData.user being undefined
    setNewUsername(userData?.user?.username || "");
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

  // Închide nav la schimbarea rutei sau resize peste 640px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) setNavOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fatfit-container">
      <div className="head" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1001, width: "100vw" }}>
        {/* Burger bar button only on mobile */}
        <button
          className="hamburger-btn"
          aria-label="Open navigation"
          onClick={() => setNavOpen((v) => !v)}
        >
          <img
            src="/assets/burger-bar.png"
            alt="menu"
            style={{ width: 32, height: 32 }}
          />
        </button>
        <img
          className="logo"
          src="/assets/LOGOwitoutBackgorund.png"
          alt="logo"
          style={{ height: 120, maxWidth: 220, width: "auto" }}
        />
        {/* Show header_right only on desktop */}
        <div className="header_right">
          {/* Username button opens modal */}
          <button className="user" onClick={handleOpenUserModal}>
            Hello, {(userData && userData.user && userData.user.username) || username}!
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
      <div
        className={`navigation${navOpen ? " open" : ""}`}
        onClick={() => navOpen && setNavOpen(false)}
        style={navOpen ? { pointerEvents: "auto" } : {}}
      >
        {/* Show nav-mobile-user only on mobile */}
        <div className="nav-mobile-user">
          <button className="user" onClick={handleOpenUserModal}>
            Hello, {(userData && userData.user && userData.user.username) || username}!
          </button>
          <button className="logout" onClick={() => {
            localStorage.removeItem("username");
            localStorage.removeItem("token");
            navigate('/');
          }}>Logout</button>
        </div>
        {/* Use goToRoute for navigation to ensure state is updated correctly */}
        <button className="button" onClick={() => { goToRoute('/workout'); setNavOpen(false); }}>Workout</button>
        <button className="button" onClick={() => { goToRoute('/meals'); setNavOpen(false); }}>Food</button>
        <button className="button" onClick={() => { goToRoute('/recipes'); setNavOpen(false); }}>Recipes</button>
        <button className="button" onClick={() => { goToRoute('/for-you'); setNavOpen(false); }}>Your Recipes</button>
        <button className="button" onClick={() => { returnCalorieCounter(); setNavOpen(false); }}>Home</button>
      </div>
      <div className="main_fatfit" style={{ height: "calc(100vh - 100px)", overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 24 }}>Loading user data...</div>
        ) : error ? (
          <div style={{ color: "red", padding: 24 }}>Error: {error}</div>
        ) : !userData || !userData.user ? (
          <div style={{ padding: 24 }}>No user data available.</div>
        ) : showForYouRecipes ? (
          <ForYouRecipes username={username} />
        ) : showCalorieCounter ? (
          <CalorieCounter
            username={username}
            initialCalories={userData?.dailyCalorieTarget}
            userGoal={userData?.goal}
          />
        ) : (
          <Outlet context={{ username }} />
        )}
      </div>
    </div>
  );
};

export default FitFatPage;