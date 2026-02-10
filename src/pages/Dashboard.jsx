import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit3, LogOut, FileText } from 'lucide-react';
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
      .order('created_at', { ascending: false });

    if (!error) setResumes(data || []);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This resume will be deleted permanently!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981', // Success Green
      cancelButtonColor: '#ef4444', // Danger Red
      confirmButtonText: 'Yes, delete it!',
      borderRadius: '15px'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('resumes').delete().eq('id', id);
      if (!error) {
        Swal.fire('Deleted!', 'Resume removed.', 'success');
        fetchResumes(user.id);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const filteredResumes = resumes.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="spinner-border text-success" role="status"></div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 p-4" style={{ backgroundColor: '#f3f4f6' }}>
      <div className="container">
        
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h2 className="fw-bold text-dark m-0">My Resumes</h2>
            <p className="text-secondary small">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-white shadow-sm rounded-pill px-4 fw-bold border-0">
            <LogOut size={18} className="me-2" /> Logout
          </button>
        </div>

        {/* Search Bar */}
        <div className="position-relative mb-5">
          <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" size={20} />
          <input 
            type="text" 
            className="form-control border-0 shadow-sm ps-5 py-3" 
            style={{ borderRadius: '15px' }}
            placeholder="Search resumes by title..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="row g-4">
          {/* Create New Card */}
          <div className="col-md-4">
            <div 
              className="card border-0 shadow-sm h-100 d-flex flex-column justify-content-center align-items-center p-5 text-center transition-card"
              style={{ borderRadius: '24px', cursor: 'pointer', backgroundColor: '#ffffff' }}
              onClick={() => navigate('/editor/new')}
            >
              <div className="bg-success bg-opacity-10 p-3 rounded-circle mb-3">
                <Plus size={32} className="text-success" />
              </div>
              <h6 className="fw-bold text-dark">Create New</h6>
              <p className="small text-secondary m-0">Start building from scratch</p>
            </div>
          </div>

          {/* Resume Cards */}
          {filteredResumes.map((resume) => (
            <div className="col-md-4" key={resume.id}>
              <div className="card border-0 shadow-sm h-100 p-4" style={{ borderRadius: '24px', backgroundColor: '#ffffff' }}>
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-light p-3 rounded-3 me-3">
                    <FileText size={24} className="text-dark" />
                  </div>
                  <div className="overflow-hidden">
                    <h6 className="fw-bold text-dark text-truncate m-0">{resume.title}</h6>
                    <p className="text-muted small m-0">Modified: {new Date(resume.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="d-flex gap-2 mt-auto">
                  <button 
                    onClick={() => navigate(`/editor/${resume.id}`)} 
                    className="btn btn-dark flex-grow-1 rounded-pill fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                  >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(resume.id)} 
                    className="btn btn-outline-danger rounded-circle p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredResumes.length === 0 && !loading && (
          <div className="text-center mt-5 py-5">
            <h5 className="text-secondary">No resumes found matching "{searchTerm}"</h5>
          </div>
        )}

      </div>

      {/* Extra Styling for Hover Effect */}
      <style>{`
        .transition-card { transition: transform 0.2s ease, shadow 0.2s ease; }
        .transition-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important; }
      `}</style>
    </div>
  );
};

export default Dashboard;