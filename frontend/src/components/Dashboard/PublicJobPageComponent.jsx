// frontend/src/components/application/PublicJobPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getJobPosting } from '../../lib/api';
import { useSubmitApplication } from '../../hooks/useApplications';
import { useToast } from '../../contexts/ToastContext';
import { formatDate } from '../../lib/utils';
import { Briefcase, MapPin, Calendar, Upload, Send, FileText, CheckCircle, X } from 'lucide-react';

const PublicJobPageComponent = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => getJobPosting(jobId),
    enabled: !!jobId,
  });

  const submitApplication = useSubmitApplication();

  const [formData, setFormData] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    resume: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      addToast('Please upload a PDF or Word document', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be less than 5MB', 'error');
      return;
    }
    setFormData({ ...formData, resume: file });
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeFile = () => {
    setFormData({ ...formData, resume: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.candidate_name || !formData.candidate_email || !formData.resume) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append("job_posting_id", jobId);
      formPayload.append("candidate_name", formData.candidate_name);
      formPayload.append("candidate_email", formData.candidate_email);
      formPayload.append("candidate_phone", formData.candidate_phone);
      formPayload.append("resume", formData.resume);

      const result = await submitApplication.mutateAsync(formPayload);

      addToast('Application submitted successfully!', 'success');

      navigate('/status', {
        state: {
          applicationId: result.application_id,
          email: formData.candidate_email
        }
      });
    } catch (error) {
      addToast(error.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-indigo-600"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium">Loading job details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl font-bold mx-auto mb-4">
            !
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Job Not Found</h3>
          <p className="text-sm text-gray-500">
            The job posting you're looking for doesn't exist or is no longer active.
          </p>
        </div>
      </div>
    );
  }

  const isFormValid = formData.candidate_name && formData.candidate_email && formData.resume;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-gray-50 to-white font-sans">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 py-12 px-6 sm:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/95 text-indigo-600 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-4 shadow-sm">
            <Briefcase size={14} className="text-indigo-600" />
            <span>{job.company}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            {job.title}
          </h1>
          <div className="flex items-center justify-center gap-4 flex-wrap text-white/80 text-sm">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-white/70" />
              <span>{job.location}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/40"></div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-white/70" />
              <span>Posted {formatDate(job.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto -mt-8 px-4 sm:px-6 pb-16 relative z-10">
        {/* Job Description Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About this role</h2>
          <div className="text-[15px] leading-relaxed text-gray-700 whitespace-pre-line">
            {job.description}
          </div>
        </div>

        {/* Space Divider */}
        <div className="h-6"></div>

        {/* Application Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Apply for this position</h2>
          <p className="text-sm text-gray-500 mb-6">
            Fill in your details and upload your resume. We'll review your application and get back to you.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="candidate_name" className="text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="candidate_name"
                  name="candidate_name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.candidate_name}
                  onChange={handleInputChange}
                  required
                  className="h-11 px-3.5 text-[15px] border border-gray-300 rounded-xl outline-none bg-white text-gray-900 transition-all w-full focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="candidate_email" className="text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="candidate_email"
                  name="candidate_email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={formData.candidate_email}
                  onChange={handleInputChange}
                  required
                  className="h-11 px-3.5 text-[15px] border border-gray-300 rounded-xl outline-none bg-white text-gray-900 transition-all w-full focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col">
              <label htmlFor="candidate_phone" className="text-sm font-semibold text-gray-700 mb-1.5">
                Phone Number <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                id="candidate_phone"
                name="candidate_phone"
                type="tel"
                placeholder="e.g. +1 (555) 123-4567"
                value={formData.candidate_phone}
                onChange={handleInputChange}
                className="h-11 px-3.5 text-[15px] border border-gray-300 rounded-xl outline-none bg-white text-gray-900 transition-all w-full focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 sm:max-w-[340px]"
              />
            </div>

            {/* Resume Upload */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1.5">
                Resume <span className="text-red-500">*</span>
              </label>

              {!formData.resume ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('resume').click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all bg-gray-50/50 hover:bg-gray-50 ${
                    isDragOver ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Upload size={22} className={isDragOver ? 'text-indigo-600' : 'text-gray-400'} />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    <span className="text-indigo-600 font-semibold cursor-pointer">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PDF, DOC, or DOCX — Max 5MB</p>
                  <input
                    id="resume"
                    name="resume"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-50/50 border border-green-200 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{formData.resume.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(formData.resume.size)}</p>
                  </div>
                  <div className="shrink-0">
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="bg-transparent border-none text-gray-400 cursor-pointer p-1 rounded hover:text-gray-600 hover:bg-gray-100 shrink-0 transition-colors"
                    title="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2 flex flex-col items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className={`inline-flex items-center justify-center gap-2.5 w-full max-w-[360px] h-12 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white text-base font-semibold border-none rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] ${
                  isSubmitting || !isFormValid ? 'opacity-50 cursor-not-allowed shadow-none active:scale-100' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Application
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center">
                By submitting, you agree to our privacy policy and terms of service.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicJobPageComponent;