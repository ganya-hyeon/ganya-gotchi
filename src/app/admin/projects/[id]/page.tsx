'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';

interface Project {
  id: string;
  cat: string;
  name: string;
  client: string;
  year: string;
  roles: string[];
  status: string;
  size: number;
  desc: {
    background: string;
    thinking: string;
    challenge: string;
  };
  outcomes: string[];
  meta: {
    period: string;
    team: string;
    tool: string;
  };
  thumbnail?: string;
}

export default function ProjectEditor() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [project, setProject] = useState<Project>({
    id: '',
    cat: 'ux',
    name: '',
    client: '',
    year: new Date().getFullYear().toString(),
    roles: [],
    status: 'wip',
    size: 5,
    desc: {
      background: '',
      thinking: '',
      challenge: ''
    },
    outcomes: [],
    meta: {
      period: '',
      team: '',
      tool: ''
    },
    thumbnail: ''
  });

  useEffect(() => {
    if (!isNew) {
      fetch('/api/projects')
        .then(res => res.json())
        .then((data: Project[]) => {
          const found = data.find(p => p.id === id);
          if (found) {
            setProject({
                ...found,
                cat: found.cat || 'ux',
                name: found.name || '',
                client: found.client || '',
                year: found.year || '2024',
                roles: found.roles || [],
                status: found.status || 'wip',
                size: found.size || 5,
                desc: found.desc || { background: '', thinking: '', challenge: '' },
                outcomes: found.outcomes || [],
                meta: found.meta || { period: '', team: '', tool: '' },
                thumbnail: found.thumbnail || ''
            });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load project:', err);
          setLoading(false);
        });
    }
  }, [id, isNew]);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data: { success: boolean; url: string } = await res.json();
      if (data.success) {
        setProject(prev => ({ ...prev, thumbnail: data.url }));
      }
    } catch {
      console.error('Upload failed');
      alert('UPLOAD FAILED');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleSave = async () => {
    if (!project.name) {
      alert('PROJECT NAME IS REQUIRED');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...project };
      if (isNew) {
        payload.id = Math.random().toString(36).substr(2, 9);
      }

      const saveRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (saveRes.ok) {
        alert('PROJECT SAVED SUCCESSFULLY');
        router.push('/admin/projects');
      } else {
        const errorData = await saveRes.json();
        throw new Error(errorData.error || 'Save failed');
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert(`SAVE FAILED: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveThumbnail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('REALLY_REMOVE_IMAGE?')) {
      setProject({ ...project, thumbnail: '' });
    }
  };

  if (loading) return <div className="page active flex items-center justify-center">LOADING DATA...</div>;

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <div className="page-title">{isNew ? 'CREATE_PROJECT' : 'EDIT_PROJECT'}</div>
          <div className="page-subtitle">ID: {isNew ? 'AUTO_GENERATED' : id}</div>
        </div>
        <div className="page-actions">
          <Link href="/admin/projects">
            <button className="btn"><span>CANCEL</span></button>
          </Link>
          <button 
            className="btn primary" 
            onClick={handleSave}
            disabled={saving}
          >
            <span>{saving ? 'SAVING...' : 'SAVE_CHANGES'}</span>
          </button>
        </div>
      </div>

      <div className="editor-container">
        <div className="editor-main">
            <div className="form-group">
                <label>PROJECT_NAME</label>
                <input 
                    className="form-input"
                    value={project.name}
                    onChange={e => setProject({...project, name: e.target.value})}
                    placeholder="ENTER NAME..."
                />
            </div>

            <div className="form-row">
                <div className="form-group flex-1">
                    <label>CATEGORY</label>
                    <select 
                        className="form-input"
                        value={project.cat}
                        onChange={e => setProject({...project, cat: e.target.value})}
                    >
                        <option value="ux">UX DESIGN</option>
                        <option value="vid">VIDEO / MOTION</option>
                        <option value="3d">3D / INTERACTIVE</option>
                    </select>
                </div>
                <div className="form-group flex-1">
                    <label>STATUS</label>
                    <select 
                        className="form-input"
                        value={project.status}
                        onChange={e => setProject({...project, status: e.target.value})}
                    >
                        <option value="wip">WIP (IN PROGRESS)</option>
                        <option value="done">DONE (COMPLETED)</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group flex-1">
                    <label>CLIENT</label>
                    <input 
                        className="form-input"
                        value={project.client}
                        onChange={e => setProject({...project, client: e.target.value})}
                        placeholder="CLIENT NAME..."
                    />
                </div>
                <div className="form-group flex-1">
                    <label>YEAR</label>
                    <input 
                        className="form-input"
                        value={project.year}
                        onChange={e => setProject({...project, year: e.target.value})}
                        placeholder="2024..."
                    />
                </div>
            </div>

            <div className="form-group">
                <label>MAIN_IMAGE (DRAG & DROP)</label>
                <div 
                    className={`upload-zone ${isDragging ? 'dragging' : ''} ${project.thumbnail ? 'has-image' : ''}`}
                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    style={{ position: 'relative' }}
                >
                    {project.thumbnail ? (
                        <>
                            <div className="upload-preview relative w-full aspect-video">
                                <Image 
                                    src={project.thumbnail} 
                                    alt="Preview" 
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
                                    unoptimized
                                />
                            </div>
                            <div className="upload-overlay">CLICK OR DRAG TO REPLACE</div>
                        </>
                    ) : (
                        <>
                            <div className="text-2xl opacity-20">📁</div>
                            <span>DROP IMAGE HERE OR CLICK TO UPLOAD</span>
                        </>
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => {
                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                        }}
                        id="file-upload"
                        style={{ display: 'none' }}
                    />
                    <label 
                        htmlFor="file-upload" 
                        style={{ 
                            position: 'absolute', 
                            top: 0, left: 0, right: 0, bottom: 0, 
                            cursor: 'crosshair',
                            zIndex: 10
                        }} 
                    />
                    {project.thumbnail && (
                        <button 
                            type="button"
                            onClick={handleRemoveThumbnail}
                            className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-all active:scale-95 border-2 border-white/20 flex items-center justify-center"
                            title="REMOVE IMAGE"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label>DESCRIPTION: BACKGROUND</label>
                <textarea 
                    className="form-input h-20"
                    value={project.desc.background}
                    onChange={e => setProject({...project, desc: { ...project.desc, background: e.target.value }})}
                    placeholder="WHAT IS THE PROJECT ABOUT?"
                />
            </div>

            <div className="form-group">
                <label>DESCRIPTION: THINKING</label>
                <textarea 
                    className="form-input h-20"
                    value={project.desc.thinking}
                    onChange={e => setProject({...project, desc: { ...project.desc, thinking: e.target.value }})}
                    placeholder="YOUR APPROACH / PHILOSOPHY..."
                />
            </div>

            <div className="form-group">
                <label>DESCRIPTION: CHALLENGE</label>
                <textarea 
                    className="form-input h-20"
                    value={project.desc.challenge}
                    onChange={e => setProject({...project, desc: { ...project.desc, challenge: e.target.value }})}
                    placeholder="KEY DIFFICULTIES AND SOLUTIONS..."
                />
            </div>

            <div className="form-group">
                <label>ROLES (COMMA SEPARATED)</label>
                <input 
                    className="form-input"
                    value={(project.roles || []).join(', ')}
                    onChange={e => setProject({...project, roles: e.target.value.split(',').map(t => t.trim())})}
                    placeholder="UX DESIGN, MOTION, THREE.JS..."
                />
            </div>

            <div className="form-group">
                <label>OUTCOMES (COMMA SEPARATED)</label>
                <input 
                    className="form-input"
                    value={(project.outcomes || []).join(', ')}
                    onChange={e => setProject({...project, outcomes: e.target.value.split(',').map(t => t.trim())})}
                    placeholder="REVENUE INCREASE, AWARD, CONTRACT..."
                />
            </div>
        </div>

        <div className="editor-side">
            <div className="panel">
                <div className="panel-head">PREVIEW_INFO</div>
                <div className="panel-body">
                    <div className="preview-mini">
                        <div className="preview-label">NAME: {project.name || 'Untitled'}</div>
                        <div className="preview-label">CAT: {project.cat.toUpperCase()}</div>
                        <div className="preview-label">YEAR: {project.year}</div>
                        <div className={`badge ${project.status} mt-4 inline-block`}>{project.status.toUpperCase()}</div>
                    </div>
                </div>
            </div>
            
            <div className="panel mt-4">
                <div className="panel-head">METADATA</div>
                <div className="panel-body">
                    <div className="form-group mb-0">
                        <label>PERIOD</label>
                        <input 
                            className="form-input"
                            value={project.meta.period}
                            onChange={e => setProject({...project, meta: { ...project.meta, period: e.target.value }})}
                            placeholder="2024.03 - 2024.04"
                        />
                    </div>
                    <div className="form-group mt-4 mb-0">
                        <label>TEAM_SIZE</label>
                        <input 
                            className="form-input"
                            value={project.meta.team}
                            onChange={e => setProject({...project, meta: { ...project.meta, team: e.target.value }})}
                            placeholder="SOLO / TEAM OF 2"
                        />
                    </div>
                    <div className="form-group mt-4 mb-0">
                        <label>TOOLS_USED</label>
                        <input 
                            className="form-input"
                            value={project.meta.tool}
                            onChange={e => setProject({...project, meta: { ...project.meta, tool: e.target.value }})}
                            placeholder="FIGMA, C4D, REACT..."
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
