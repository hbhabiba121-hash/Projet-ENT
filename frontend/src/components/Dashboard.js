import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const testRoute = async (routeType) => {
    setTestLoading(true);
    setTestResult(null);
    
    try {
      let result;
      switch (routeType) {
        case 'student':
          result = await authService.testStudentRoute();
          break;
        case 'teacher':
          result = await authService.testTeacherRoute();
          break;
        case 'admin':
          result = await authService.testAdminRoute();
          break;
        default:
          return;
      }
      setTestResult({ success: true, data: result });
    } catch (error) {
      setTestResult({ 
        success: false, 
        error: error.response?.data?.detail || 'Accès non autorisé' 
      });
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Chargement de votre espace...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">EST</div>
          <div>
            <h1>ENT EST Salé</h1>
            <p>Espace Numérique de Travail</p>
          </div>
        </div>
        <div className="navbar-user">
          <div className="user-info">
            <div className="user-name">{user?.name || user?.username}</div>
            <div className="user-role">
              {user?.roles?.map(role => {
                switch(role) {
                  case 'student': return '👨‍🎓 Étudiant';
                  case 'teacher': return '👨‍🏫 Enseignant';
                  case 'admin': return '👑 Administrateur';
                  default: return role;
                }
              }).join(' • ')}
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-card fade-in">
          <h1>Bienvenue, {user?.name?.split(' ')[0] || user?.username} !</h1>
          <p>
            Bienvenue sur votre Espace Numérique de Travail. 
            Accédez à tous les services pédagogiques et administratifs de l'EST Salé.
          </p>
          <div className="role-badge">
            {user?.roles?.map(role => {
              switch(role) {
                case 'student': return '📚 Espace Étudiant';
                case 'teacher': return '📝 Espace Enseignant';
                case 'admin': return '⚙️ Espace Administration';
                default: return role;
              }
            }).join(' • ')}
          </div>
        </div>

        <div className="role-tests fade-in">
          <h2>Test des accès</h2>
          <div className="test-buttons">
            <button 
              onClick={() => testRoute('student')}
              disabled={testLoading}
              className="test-btn student"
            >
              👨‍🎓 Route Étudiant
            </button>
            <button 
              onClick={() => testRoute('teacher')}
              disabled={testLoading}
              className="test-btn teacher"
            >
              👨‍🏫 Route Enseignant
            </button>
            <button 
              onClick={() => testRoute('admin')}
              disabled={testLoading}
              className="test-btn admin"
            >
              👑 Route Administrateur
            </button>
          </div>

          {testLoading && <div className="loading">Test en cours...</div>}

          {testResult && (
            <div className="test-result">
              <h3>
                {testResult.success ? '✅ Accès autorisé' : '❌ Accès refusé'}
              </h3>
              <pre>
                {testResult.success 
                  ? JSON.stringify(testResult.data, null, 2)
                  : testResult.error}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;