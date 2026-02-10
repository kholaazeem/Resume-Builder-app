import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { User, Briefcase, GraduationCap, Award, Plus, Trash2, ChevronLeft, Camera } from 'lucide-react';
import Swal from 'sweetalert2';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const componentRef = useRef();
  const [uploading, setUploading] = useState(false);

  const [resumeData, setResumeData] = useState({
    personalInfo: { fullName: '', role: '', email: '', phone: '', profileImage: '' },
    summary: '',
    experience: [{ company: '', role: '', startYear: '', endYear: '', description: '' }],
    education: [{ school: '', degree: '', startYear: '', endYear: '' }],
    skills: '', 
  });

  useEffect(() => {
    if (id !== 'new') {
      const loadData = async () => {
        const { data } = await supabase.from('resumes').select('*').eq('id', id).single();
        if (data) setResumeData(data.content);
      };
      loadData();
    }
  }, [id]);

  // --- Image Upload Logic ---
  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('resumes').getPublicUrl(filePath);
      
      setResumeData({
        ...resumeData,
        personalInfo: { ...resumeData.personalInfo, profileImage: data.publicUrl }
      });

      Swal.fire('Success', 'Profile picture uploaded!', 'success');
    } catch (error) {
      Swal.fire('Error', 'Upload failed: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  // --- Fixed Download Logic ---
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${resumeData.personalInfo.fullName || 'Resume'}_CV`,
  });

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { 
      user_id: user.id, 
      title: resumeData.personalInfo.fullName || 'Untitled', 
      content: resumeData 
    };

    const { error } = id === 'new' 
      ? await supabase.from('resumes').insert([payload])
      : await supabase.from('resumes').update(payload).eq('id', id);

    if (!error) {
      Swal.fire({ title: 'Success!', text: 'Resume saved to cloud.', icon: 'success', confirmButtonColor: '#0d9488' });
      navigate('/dashboard');
    }
  };

  const inputStyle = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '12px' };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f3f4f6', fontFamily: 'Inter, sans-serif' }}>
      {/* Header Bar */}
      <div className="bg-white border-bottom px-4 py-2 d-flex justify-content-between align-items-center sticky-top shadow-sm">
        <button onClick={() => navigate('/dashboard')} className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-1 fw-bold">
          <ChevronLeft size={20} /> Dashboard
        </button>
        <div className="d-flex gap-2">
          <button onClick={handleSave} className="btn btn-dark rounded-pill px-4 fw-bold">Save Changes</button>
          <button onClick={() => handlePrint()} className="btn text-white rounded-pill px-4 fw-bold" style={{ backgroundColor: '#0d9488' }}>Download PDF</button>
        </div>
      </div>

      <div className="container-fluid py-4">
        <div className="row g-4">
          
          {/* LEFT: INPUT PANEL */}
          <div className="col-lg-5" style={{ height: '85vh', overflowY: 'auto' }}>
            
            {/* 1. Personal Info Card with Image Upload */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex align-items-center mb-4">
                <div className="p-2 rounded-3 me-3" style={{ backgroundColor: '#f0fdfa' }}>
                  <User size={20} style={{ color: '#0d9488' }} />
                </div>
                <h5 className="fw-bold m-0 text-dark">Personal Info</h5>
              </div>

              {/* Image Upload Row */}
              <div className="d-flex align-items-center gap-3 mb-4 p-3 border rounded-4 bg-light shadow-sm">
                <div className="position-relative">
                  {resumeData.personalInfo.profileImage ? (
                    <img src={resumeData.personalInfo.profileImage} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center bg-secondary text-white rounded-circle" style={{ width: '80px', height: '80px' }}>
                      <Camera size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <label className="btn btn-sm btn-dark rounded-pill cursor-pointer px-3 mb-1">
                    {uploading ? 'Uploading...' : 'Upload Picture'}
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  <p className="small text-muted mb-0">Add your professional photo</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12"><input style={inputStyle} className="form-control shadow-none" placeholder="Full Name" value={resumeData.personalInfo.fullName} onChange={(e) => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, fullName: e.target.value}})} /></div>
                <div className="col-12"><input style={inputStyle} className="form-control shadow-none" placeholder="Job Role" value={resumeData.personalInfo.role} onChange={(e) => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, role: e.target.value}})} /></div>
                <div className="col-md-6"><input style={inputStyle} className="form-control shadow-none" placeholder="Email" value={resumeData.personalInfo.email} onChange={(e) => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, email: e.target.value}})} /></div>
                <div className="col-md-6"><input style={inputStyle} className="form-control shadow-none" placeholder="Phone" value={resumeData.personalInfo.phone} onChange={(e) => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, phone: e.target.value}})} /></div>
              </div>
            </div>

            {/* 2. Experience Card */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                   <div className="p-2 rounded-3 me-3" style={{ backgroundColor: '#f0fdfa' }}>
                     <Briefcase size={20} style={{ color: '#0d9488' }} />
                   </div>
                   <h5 className="fw-bold m-0 text-dark">Experience</h5>
                </div>
                <button className="btn btn-sm px-3 rounded-pill fw-bold border" style={{ backgroundColor: '#f9fafb' }} 
                  onClick={() => setResumeData({...resumeData, experience: [...resumeData.experience, {company: '', role: '', startYear: '', endYear: '', description: ''}]})}>
                  + Add
                </button>
              </div>
              {resumeData.experience.map((exp, i) => (
                <div key={i} className="mb-4 p-3 position-relative border border-light rounded-4" style={{ backgroundColor: '#f9fafb' }}>
                  <button className="btn btn-link text-danger position-absolute top-0 end-0 mt-2 me-2 p-1" onClick={() => {
                      let list = [...resumeData.experience]; list.splice(i, 1); setResumeData({ ...resumeData, experience: list });
                  }}><Trash2 size={18} /></button>
                  <div className="row g-3 pt-2">
                    <div className="col-12"><input style={inputStyle} className="form-control shadow-none bg-white" placeholder="Job Role" value={exp.role} onChange={(e) => { let l = [...resumeData.experience]; l[i].role = e.target.value; setResumeData({...resumeData, experience: l}); }} /></div>
                    <div className="col-12"><input style={inputStyle} className="form-control shadow-none bg-white" placeholder="Company" value={exp.company} onChange={(e) => { let l = [...resumeData.experience]; l[i].company = e.target.value; setResumeData({...resumeData, experience: l}); }} /></div>
                    <div className="col-md-6"><input style={inputStyle} className="form-control shadow-none bg-white" placeholder="Start Year" value={exp.startYear} onChange={(e) => { let l = [...resumeData.experience]; l[i].startYear = e.target.value; setResumeData({...resumeData, experience: l}); }} /></div>
                    <div className="col-md-6"><input style={inputStyle} className="form-control shadow-none bg-white" placeholder="End Year" value={exp.endYear} onChange={(e) => { let l = [...resumeData.experience]; l[i].endYear = e.target.value; setResumeData({...resumeData, experience: l}); }} /></div>
                    <div className="col-12"><textarea style={inputStyle} className="form-control shadow-none bg-white" rows="2" placeholder="Description" value={exp.description} onChange={(e) => { let l = [...resumeData.experience]; l[i].description = e.target.value; setResumeData({...resumeData, experience: l}); }} /></div>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Education Card */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                   <div className="p-2 rounded-3 me-3" style={{ backgroundColor: '#f0fdfa' }}>
                     <GraduationCap size={20} style={{ color: '#0d9488' }} />
                   </div>
                   <h5 className="fw-bold m-0 text-dark">Education</h5>
                </div>
                <button className="btn btn-sm px-3 rounded-pill fw-bold border" style={{ backgroundColor: '#f9fafb' }} 
                  onClick={() => setResumeData({...resumeData, education: [...resumeData.education, {school: '', degree: '', startYear: '', endYear: ''}]})}>
                  + Add
                </button>
              </div>
              {resumeData.education.map((edu, i) => (
                <div key={i} className="mb-3 p-3 position-relative border border-light rounded-4" style={{ backgroundColor: '#f9fafb' }}>
                  <button className="btn btn-link text-danger position-absolute top-0 end-0 mt-2 me-2 p-1" onClick={() => {
                      let list = [...resumeData.education]; list.splice(i, 1); setResumeData({ ...resumeData, education: list });
                  }}><Trash2 size={18} /></button>
                  <div className="row g-3 pt-2">
                    <div className="col-12"><input style={inputStyle} className="form-control shadow-none bg-white" placeholder="University/School" value={edu.school} onChange={(e) => { let l = [...resumeData.education]; l[i].school = e.target.value; setResumeData({...resumeData, education: l}); }} /></div>
                    <div className="col-12"><input style={inputStyle} className="form-control shadow-none bg-white" placeholder="Degree" value={edu.degree} onChange={(e) => { let l = [...resumeData.education]; l[i].degree = e.target.value; setResumeData({...resumeData, education: l}); }} /></div>
                    <div className="col-md-6"><input style={inputStyle} className="form-control shadow-none bg-white" placeholder="Start Year" value={edu.startYear} onChange={(e) => { let l = [...resumeData.education]; l[i].startYear = e.target.value; setResumeData({...resumeData, education: l}); }} /></div>
                    <div className="col-md-6"><input style={inputStyle} className="form-control shadow-none bg-white" placeholder="End Year" value={edu.endYear} onChange={(e) => { let l = [...resumeData.education]; l[i].endYear = e.target.value; setResumeData({...resumeData, education: l}); }} /></div>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Skills Card */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '20px' }}>
              <div className="d-flex align-items-center mb-4">
                <div className="p-2 rounded-3 me-3" style={{ backgroundColor: '#f0fdfa' }}>
                  <Award size={20} style={{ color: '#0d9488' }} />
                </div>
                <h5 className="fw-bold m-0 text-dark">Skills</h5>
              </div>
              <textarea style={inputStyle} className="form-control shadow-none bg-light" rows="3" placeholder="React, JavaScript, Figma, Python..." value={resumeData.skills} onChange={(e) => setResumeData({...resumeData, skills: e.target.value})} />
              <small className="text-muted mt-2">Enter skills separated by commas</small>
            </div>

          </div>

          {/* RIGHT: LIVE PREVIEW PANEL */}
          <div className="col-lg-7 d-flex justify-content-center">
            <div className="preview-container shadow-lg bg-white" ref={componentRef} style={{ width: '210mm', minHeight: '297mm', padding: '50px' }}>
              
              {/* Header with Name and Image side-by-side */}
              <div className="d-flex justify-content-between align-items-center mb-5 pb-4 border-bottom">
                <div>
                  <h1 className="fw-bold m-0" style={{ fontSize: '2.8rem', color: '#111827' }}>{resumeData.personalInfo.fullName || "YOUR NAME"}</h1>
                  <h4 className="fw-semibold mt-1" style={{ color: '#0d9488' }}>{resumeData.personalInfo.role || "Professional Title"}</h4>
                  <div className="d-flex gap-3 text-muted mt-3 small">
                    <span>✉️ {resumeData.personalInfo.email}</span>
                    <span>📞 {resumeData.personalInfo.phone}</span>
                  </div>
                </div>
                {/* Profile Pic on Right Side */}
                {resumeData.personalInfo.profileImage && (
                  <img src={resumeData.personalInfo.profileImage} alt="Profile" style={{ width: '120px', height: '120px', borderRadius: '15px', objectFit: 'cover', border: '3px solid #f3f4f6' }} />
                )}
              </div>

              {/* Experience Preview */}
              <div className="mb-5">
                <h6 className="fw-bold text-uppercase pb-2 mb-3" style={{ color: '#0d9488', borderBottom: '2px solid #f3f4f6' }}>Experience</h6>
                {resumeData.experience.map((exp, i) => (
                  <div key={i} className="mb-4">
                    <div className="d-flex justify-content-between align-items-baseline">
                      <h6 className="fw-bold m-0">{exp.role}</h6>
                      <span className="small text-muted">{exp.startYear} — {exp.endYear}</span>
                    </div>
                    <p className="small fw-semibold m-0" style={{ color: '#0d9488' }}>{exp.company}</p>
                    <p className="small text-secondary mt-1">{exp.description}</p>
                  </div>
                ))}
              </div>

              {/* Education Preview */}
              <div className="mb-5">
                <h6 className="fw-bold text-uppercase pb-2 mb-3" style={{ color: '#0d9488', borderBottom: '2px solid #f3f4f6' }}>Education</h6>
                {resumeData.education.map((edu, i) => (
                  <div key={i} className="mb-3">
                    <div className="d-flex justify-content-between">
                      <h6 className="fw-bold m-0">{edu.degree}</h6>
                      <span className="small text-muted">{edu.startYear} — {edu.endYear}</span>
                    </div>
                    <p className="small text-secondary m-0">{edu.school}</p>
                  </div>
                ))}
              </div>

              {/* Skills Preview */}
              <div className="mb-4">
                <h6 className="fw-bold text-uppercase pb-2 mb-3" style={{ color: '#0d9488', borderBottom: '2px solid #f3f4f6' }}>Skills</h6>
                <p className="small text-secondary">{resumeData.skills}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;