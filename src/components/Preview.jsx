import React from 'react';

const Preview = ({ data }) => {
  return (
    <div className="text-dark" style={{ fontFamily: 'serif' }}>
      {/* Header [cite: 24] */}
      <div className="text-center border-bottom border-dark pb-3 mb-4">
        <h1 className="text-uppercase fw-bold m-0">{data.personalInfo.fullName || "YOUR NAME"}</h1>
        <p className="m-0 small">{data.personalInfo.email} | {data.personalInfo.phone}</p>
        <p className="m-0 small">{data.personalInfo.address}</p>
      </div>

      {/* Summary [cite: 30] */}
      <div className="mb-4">
        <h5 className="fw-bold text-uppercase border-bottom border-dark">Professional Summary</h5>
        <p className="small">{data.summary || "Add your summary here..."}</p>
      </div>

      {/* Skills [cite: 27] */}
      <div className="mb-4">
        <h5 className="fw-bold text-uppercase border-bottom border-dark">Skills</h5>
        <p className="small">{data.skills.join(' • ')}</p>
      </div>
    </div>
  );
};

export default Preview;