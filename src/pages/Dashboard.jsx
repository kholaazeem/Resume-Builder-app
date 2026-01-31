import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/'); 
      } else {
        setUser(session.user);
        await fetchResumes(session.user.id);
        setLoading(false);
      }
    };
    checkUser();
  }, [navigate]);

  const fetchResumes = async (userId) => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }); // Latest resumes first

    if (error) {
      console.error('Fetch Error:', error);
    } else {
      setResumes(data || []);
    }
  };

  // Professional English SweetAlert for Delete 
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This resume will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000', // Black & White Theme
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('resumes').delete().eq('id', id);
      if (!error) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Your resume has been removed.',
          icon: 'success',
          confirmButtonColor: '#000'
        });
        fetchResumes(user.id);
      } else {
        Swal.fire('Error', 'Could not delete resume.', 'error');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut(); // 
    navigate('/');
  };

  const filteredResumes = resumes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
        <h3 className="fw-bold text-uppercase" style={{ letterSpacing: '3px' }}>Loading...</h3>
      </div>
    );
  }

  return (
    <div className="container mt-5 animate__animated animate__fadeIn">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center border-bottom border-dark pb-3 mb-4">
        <h1 className="fw-bold text-uppercase m-0" style={{ letterSpacing: '1px' }}>Dashboard</h1>
        <div className="d-flex align-items-center gap-3">
          <span className="small text-secondary d-none d-md-inline">{user?.email}</span>
          <button onClick={handleLogout} className="btn btn-dark btn-sm fw-bold rounded-0 px-3">LOGOUT</button>
        </div>
      </div>

      {/* Search Bar Section  */}
      <div className="mb-5">
        <label className="small fw-bold mb-1 text-uppercase text-dark">Search Resumes</label>
        <input 
          type="text" 
          className="form-control border-dark rounded-0 shadow-none py-2" 
          placeholder="SEARCH BY TITLE OR SKILL..." 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="row g-4 mb-5">
        {/* New Resume Creation Card [cite: 23] */}
        <div className="col-md-4">
          <div 
            className="card border-dark shadow-none text-center p-5 h-100 d-flex flex-column justify-content-center align-items-center" 
            style={{ borderStyle: 'dashed', cursor: 'pointer', borderRadius: '0', transition: 'all 0.3s ease' }}
            onClick={() => navigate('/editor/new')}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#000';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#fff';
              e.currentTarget.style.color = '#000';
            }}
          >
            <h1 className="display-4 fw-light">+</h1>
            <p className="fw-bold text-uppercase mt-2">Create New Resume</p>
          </div>
        </div>

        {/* Dynamic Resume List [cite: 35] */}
        {filteredResumes.map((resume) => (
          <div className="col-md-4" key={resume.id}>
            <div className="card border-dark shadow-none h-100 rounded-0 transition-card">
              <div className="card-body d-flex flex-column">
                <div className="mb-4">
                  <span className="badge bg-dark rounded-0 text-uppercase mb-2" style={{ fontSize: '10px' }}>Professional Template</span>
                  <h5 className="card-title fw-bold text-uppercase mb-1">{resume.title || 'Untitled Resume'}</h5>
                  <p className="text-muted small">Last updated: {new Date(resume.created_at).toLocaleDateString()}</p>
                </div>
                <div className="d-flex gap-2 border-top border-dark pt-3 mt-auto">
                  <button 
                    onClick={() => navigate(`/editor/${resume.id}`)} 
                    className="btn btn-outline-dark btn-sm flex-grow-1 rounded-0 fw-bold"
                  >
                    EDIT
                  </button>
                  <button 
                    onClick={() => handleDelete(resume.id)} 
                    className="btn btn-outline-danger btn-sm rounded-0 fw-bold"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResumes.length === 0 && !loading && searchTerm && (
        <div className="text-center py-5">
          <p className="text-muted text-uppercase fw-bold">No results found for "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;