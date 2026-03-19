import { useEffect, useState, useRef } from 'react';
import { Upload, Search, Tag, FileText, Trash2, X } from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function KnowledgeBase() {
  const { documents, tags, loading, fetch, fetchTags, upload, remove } = useDocumentStore();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) { fetch(); fetchTags(); }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetch(selectedTag || undefined, search || undefined);
  }, [selectedTag, search]);

  if (!isAuthenticated) {
    return <div className="text-center text-gray-500 mt-20">Please sign in to access the knowledge base.</div>;
  }

  const handleFile = async (file: File) => {
    const title = uploadTitle || file.name;
    const tagArr = uploadTags.split(',').map(t => t.trim()).filter(Boolean);
    await upload(file, title, tagArr);
    setShowUpload(false);
    setUploadTitle('');
    setUploadTags('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3 flex-1 max-w-md">
          <Search size={16} className="text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="bg-transparent border-none text-sm text-white px-2 py-2 flex-1 focus:outline-none"
          />
        </div>
        {tags.length > 0 && (
          <select
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300"
          >
            <option value="">All Tags</option>
            {tags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <button onClick={() => setShowUpload(!showUpload)} className="btn-primary text-sm flex items-center gap-2">
          {showUpload ? <X size={16} /> : <Upload size={16} />}
          {showUpload ? 'Cancel' : 'Upload'}
        </button>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <Card>
          <div className="space-y-3">
            <input
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              placeholder="Document title (optional)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              value={uploadTags}
              onChange={e => setUploadTags(e.target.value)}
              placeholder="Tags (comma separated: bitcoin, research, defi)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Drop a file here or click to browse</p>
              <p className="text-xs text-gray-600 mt-1">PDF, Markdown, or Text files (max 10MB)</p>
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.md,.txt,.text" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        </Card>
      )}

      {/* Document Grid */}
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map(doc => (
            <Card key={doc.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white truncate">{doc.title}</h3>
                </div>
                <button onClick={() => remove(doc.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
              <p className="text-xs text-gray-500 mb-2">{doc.filename} · {(doc.fileSize / 1024).toFixed(0)}KB</p>
              <p className="text-xs text-gray-400 line-clamp-3">{doc.content}</p>
              {doc.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {doc.tags.map(t => (
                    <span key={t} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Tag size={8} />{t}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-gray-600 mt-2">{new Date(doc.createdAt).toLocaleDateString()}</p>
            </Card>
          ))}
          {documents.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              <FileText className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              <p className="text-sm">No documents yet. Upload your research to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
