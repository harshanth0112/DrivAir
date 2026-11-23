import React, { useState, useEffect, useRef } from 'react';
import api from '../../lib/api.js';
import {
  Upload,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Paperclip
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function DocumentManager({ ownerType, vehicleId = null }) {
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState('drivingLicence');
  const [docNumber, setDocNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const loadDocuments = async () => {
    try {
      const res = await api.get('/documents/mine');
      setDocuments(res.data.data.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10MB limit. Please choose a smaller file.');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a document file from your device to upload.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('ownerType', ownerType);
      formData.append('documentType', docType);
      if (docNumber) formData.append('documentNumber', docNumber);
      if (vehicleId) formData.append('vehicleId', vehicleId);

      const res = await api.post('/documents/upload-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(res.data.message || 'Document uploaded directly from device and queued for verification!');
      setSelectedFile(null);
      setDocNumber('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Direct file upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Direct File Upload Form */}
      <Card variant="surface" className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--color-primary)] text-[var(--color-canvas)] rounded-xl">
            <Upload size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Direct File Upload from Device</h4>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Select PDF, PNG, or JPG directly from your computer or phone.
            </p>
          </div>
        </div>

        {message && (
          <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 p-3 rounded-xl font-medium">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-300 bg-red-950/60 border border-red-800/80 p-3 rounded-xl font-medium">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
              Document Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
            >
              <option value="drivingLicence" className="bg-[#171717]">Driving Licence (Commercial / HMV)</option>
              <option value="registrationCertificate" className="bg-[#171717]">Registration Certificate (RC)</option>
              <option value="vehicleInsurance" className="bg-[#171717]">Commercial Vehicle Insurance</option>
              <option value="businessRegistration" className="bg-[#171717]">Company / Business Registration</option>
              <option value="gstCertificate" className="bg-[#171717]">GST Registration Certificate</option>
              <option value="policeVerification" className="bg-[#171717]">Police Background Verification</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
              ID / License Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. DL-1420110012345"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
              Choose Document File (PDF / Image)
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileChange}
                required
                className="w-full px-3 py-2 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[var(--color-primary)] file:text-[var(--color-canvas)] hover:file:opacity-90 cursor-pointer"
              />
            </div>
          </div>

          {selectedFile && (
            <div className="md:col-span-3 flex items-center gap-2 p-2.5 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-xl text-xs text-[var(--color-primary)]">
              <Paperclip size={14} className="text-[var(--color-primary)]" />
              <span className="font-semibold">Selected:</span>
              <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          <div className="md:col-span-3 pt-1">
            <Button
              type="submit"
              disabled={loading || !selectedFile}
              variant="primary"
              className="text-xs"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Uploading from device...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Upload from Device Now</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Submitted Documents Feed */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Your Submitted Records ({documents.length})
        </h4>

        {documents.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)] py-2">
            No compliance documents submitted yet. Select a file from your device above to submit for verification.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((d) => (
              <Card
                key={d._id}
                variant="elevated"
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white capitalize">
                      {d.documentType.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <Badge variant={d.status === 'verified' ? 'verified' : d.status === 'rejected' ? 'rejected' : 'pending'}>
                      {d.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    ID: {d.documentNumber || 'N/A'} {d.originalFileName ? `· ${d.originalFileName}` : ''}
                  </p>
                </div>

                <a
                  href={d.secureUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="View / Inspect Document"
                  className="p-2 text-[var(--color-primary)] hover:bg-white/5 rounded-full transition"
                >
                  <ExternalLink size={16} />
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
