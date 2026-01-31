import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();

  const [resumeData, setResumeData] = useState({
    title: 'My Resume',
    fullName: '',
    email: '',
    phone: '',
    summary: '',
    education: '',
    experience: '',
    skills: ''
  });

  // Load existing data if editing
  useEffect(() => {
    if (id !== 'new') {
      fetchResume();
    }
  }, [id]);

  const fetchResume = async () => {
    const { data, error } = await supabase.from('resumes').select('*').eq('id', id).single();
    if (data) setResumeData(data.content);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const payload = {
      user_id: user.id,
      title: resumeData.title,
      content: resumeData
    };

    let error;
    if (id === 'new') {
      const { error: insError } = await supabase.from('resumes').insert([payload]);
      error = insError;
    } else {
      const { error: updError } = await supabase.from('resumes').update(payload).eq('id', id);
      error = updError;
    }

    if (error) {
      Swal.fire('Error', error.message, 'error');
    } else {
      Swal.fire('Saved!', 'Your resume has been stored.', 'success');
      navigate('/dashboard');
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleChange = (e) => {
    setResumeData({ ...resumeData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        {/* FORM SIDE */}
        <div className="col-md-5 border-end border-dark pe-4">
          <h4 className="fw-bold mb-4 text-uppercase">Resume Details</h4>
          <div className="mb-3">
            <label className="form-label small fw-bold">RESUME TITLE</label>
            <input name="title" className="form-control border-dark rounded-0 shadow-none" value={resumeData.title} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">FULL NAME</label>
            <input name="fullName" className="form-control border-dark rounded-0 shadow-none" onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">SUMMARY</label>
            <textarea name="summary" className="form-control border-dark rounded-0 shadow-none" rows="3" onChange={handleChange}></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">EDUCATION</label>
            <textarea name="education" className="form-control border-dark rounded-0 shadow-none" rows="3" placeholder="Degree, University (Year)" onChange={handleChange}></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">SKILLS</label>
            <input name="skills" className="form-control border-dark rounded-0 shadow-none" placeholder="React, Bootstrap, Supabase" onChange={handleChange} />
          </div>
          
          <div className="d-flex gap-2 mt-4">
            <button onClick={handleSave} className="btn btn-dark rounded-0 fw-bold flex-grow-1">SAVE TO CLOUD</button>
            <button onClick={handlePrint} className="btn btn-outline-dark rounded-0 fw-bold">DOWNLOAD PDF</button>
          </div>
        </div>

        {/* PREVIEW SIDE */}
        <div className="col-md-7 bg-light p-5 overflow-auto" style={{ maxHeight: '85vh' }}>
          <div ref={componentRef} className="bg-white p-5 shadow-sm mx-auto border" style={{ width: '100%', minHeight: '297mm', color: '#000' }}>
            <h1 className="text-center text-uppercase fw-bold m-0">{resumeData.fullName || 'YOUR NAME'}</h1>
            <p className="text-center border-bottom border-dark pb-3 mb-4">{resumeData.email} | {resumeData.phone}</p>
            
            <div className="mb-4">
              <h5 className="fw-bold text-uppercase border-bottom border-dark pb-1">Profile Summary</h5>
              <p>{resumeData.summary}</p>
            </div>

            <div className="mb-4">
              <h5 className="fw-bold text-uppercase border-bottom border-dark pb-1">Education</h5>
              <p style={{ whiteSpace: 'pre-line' }}>{resumeData.education}</p>
            </div>

            <div className="mb-4">
              <h5 className="fw-bold text-uppercase border-bottom border-dark pb-1">Skills</h5>
              <p>{resumeData.skills}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;