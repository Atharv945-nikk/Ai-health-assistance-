import React, { useState, useEffect, useRef } from 'react';
import { imageApi } from '../api/client.js';
import {
  Scan,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Eye,
  ShieldAlert,
  Info,
  Layers,
} from 'lucide-react';
import { MedicalImage } from '../types/index.js';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

export const MedicalImagePage: React.FC = () => {
  const [images, setImages] = useState<MedicalImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<MedicalImage | null>(null);
  const [notes, setNotes] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    try {
      const list = await imageApi.getImages();
      setImages(list);
      if (list.length > 0 && !selectedImage) {
        setSelectedImage(list[0]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Please choose a medical image to analyze.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await imageApi.uploadAndAnalyze(file, notes);
      setImages([result, ...images]);
      setSelectedImage(result);
      setNotes('');
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Image vision processing failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scan record?')) return;
    try {
      await imageApi.deleteImage(id);
      const remaining = images.filter(img => img.id !== id);
      setImages(remaining);
      if (selectedImage?.id === id) {
        setSelectedImage(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
          <Scan className="w-4 h-4" />
          <span>Multimodal Vision Subsystem</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Medical Image Vision Analysis</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Upload X-rays, MRI scans, CT slices, and dermatological photos. Computer vision evaluates anatomical features, structural contours, and educational findings alongside explicit uncertainty bounds.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload & Analysis Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-purple-600" />
          <span>Submit Medical Scan for Vision Review</span>
        </h3>

        <form onSubmit={handleUploadAndAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Select Medical Image (PNG, JPG, WEBP)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-purple-50/20"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                />
                <Scan className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-700 block">
                  {previewUrl ? 'Change Selected Image' : 'Click to Browse Scan File'}
                </span>
                <span className="text-[11px] text-slate-400">X-Ray, MRI, CT, Dermatology (Max 20MB)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Clinical Context or Body Part Notes (Optional)
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Left knee X-ray following a twisting sports injury, persistent localized swelling..."
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {previewUrl && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
              <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">Image Ready for Upload</span>
                <span className="text-slate-400">Click the button below to initialize vision pipeline.</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? 'Analyzing scan with vision model...' : 'Process & Analyze Medical Image'}
          </button>
        </form>
      </div>

      {/* Main Grid: Scans List (Left) & Vision Analysis Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Archived Medical Scans ({images.length})
          </h3>

          {images.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-xs text-slate-400">
              <Scan className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No medical scans analyzed yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {images.map((img) => {
                const isSelected = selectedImage?.id === img.id;
                return (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <Scan className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 text-xs truncate">{img.filename}</h4>
                          <span className="text-[11px] text-slate-500 block capitalize">
                            {img.modality} • {img.bodyPart || 'Scan'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{new Date(img.createdAt).toLocaleDateString()}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-100 text-[10px]">
                        Confidence: {Math.round((img.analysis?.confidenceScore || 0.8) * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vision Analysis Details */}
        <div className="lg:col-span-8">
          {selectedImage ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-purple-600">
                    {selectedImage.modality.toUpperCase()} Vision Interpretation
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedImage.bodyPart || 'Anatomical Region'}</h2>
                  <span className="text-xs text-slate-400">
                    File: {selectedImage.filename} • Analyzed {new Date(selectedImage.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
                  Educational Score: {Math.round((selectedImage.analysis?.confidenceScore || 0.8) * 100)}%
                </div>
              </div>

              {/* Educational Observations */}
              {selectedImage.analysis?.observations && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    AI Visual Observations
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {selectedImage.analysis.observations.map((obs, i) => (
                      <li key={i}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Potential Abnormalities */}
              {selectedImage.analysis?.possibleAbnormalities && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs space-y-2">
                  <h4 className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">
                    Features Warranting Clinical Correlation
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-amber-900">
                    {selectedImage.analysis.possibleAbnormalities.map((abn, i) => (
                      <li key={i}>{abn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Limitations & Constraints */}
              {selectedImage.analysis?.limitations && (
                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 text-xs space-y-2">
                  <h4 className="font-bold text-blue-950 uppercase tracking-wider text-[11px]">
                    Model Technical Limitations
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-blue-900/90">
                    {selectedImage.analysis.limitations.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clinical Recommendations */}
              {selectedImage.analysis?.recommendations && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-2">
                  <h4 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                    Recommended Follow-up
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-emerald-900/90">
                    {selectedImage.analysis.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prominent Radiological Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-100/60 border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold mb-1">Non-Diagnostic Radiological Disclaimer</h5>
                  <p className="leading-relaxed">
                    {selectedImage.analysis?.disclaimer || 'AI image analysis is educational and exploratory. It does NOT replace a calibrated clinical workstation review or official radiological report from a licensed Radiologist.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-200 text-slate-400 p-8">
              <Scan className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">No Medical Scan Selected</h3>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Upload a scan above or select an existing archive from the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
