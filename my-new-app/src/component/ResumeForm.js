// src/components/ResumeForm.js
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import './ResumeForm.css'; // Add custom styles for layout

const ResumeForm = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  const onDrop = (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setAnalysisResult(null); // Reset the result when a new file is uploaded
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: '.pdf',
    multiple: false,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          text += pageText + ' ';
        }

        const result = analyzeResume(text); // Analyze the extracted text
        setAnalysisResult(result); // Set the analysis result
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const analyzeResume = (text) => {
    const skillsKeywords = ['JavaScript', 'React', 'HTML', 'CSS', 'Python', 'SQL', 'Java'];
    const experienceKeywords = ['experience', 'years', 'worked', 'projects', 'lead'];

    const foundSkills = skillsKeywords.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
    const unmatchedSkills = skillsKeywords.filter(skill => !text.toLowerCase().includes(skill.toLowerCase()));

    const foundExperience = experienceKeywords.filter(exp => text.toLowerCase().includes(exp.toLowerCase()));
    const unmatchedExperience = experienceKeywords.filter(exp => !text.toLowerCase().includes(exp.toLowerCase()));

    return {
      totalWords: text.split(/\s+/).length,
      foundSkills,
      unmatchedSkills,
      foundExperience,
      unmatchedExperience,
    };
  };

  return (
    <div className="resume-form-container">
      <div className="left-side">
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <p>{fileName ? `Selected File: ${fileName}` : "Drag & drop your resume here or click to upload"}</p>
        </div>
        <button className="submit-btn" onClick={handleSubmit} disabled={!file}>
          Analyze Resume
        </button>
      </div>

      <div className="right-side">
        {analysisResult && (
          <div className="results">
            <h2>Analysis Results</h2>
            <p><strong>Total Words:</strong> {analysisResult.totalWords}</p>
            <div>
              <h3>Matched Skills:</h3>
              <ul>
                {analysisResult.foundSkills.map(skill => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ color: 'red' }}>Unmatched Skills:</h3>
              <ul>
                {analysisResult.unmatchedSkills.map(skill => (
                  <li key={skill} style={{ color: 'red' }}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Matched Experience:</h3>
              <ul>
                {analysisResult.foundExperience.map(exp => (
                  <li key={exp}>{exp}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ color: 'red' }}>Unmatched Experience:</h3>
              <ul>
                {analysisResult.unmatchedExperience.map(exp => (
                  <li key={exp} style={{ color: 'red' }}>{exp}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeForm;
