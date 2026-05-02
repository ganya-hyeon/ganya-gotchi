'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  cat: string;
  status: string;
  year: string;
  thumbnail?: string;
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then((data: Project[]) => {
        if (!Array.isArray(data)) {
          console.error('Data is not an array:', data);
          setProjects([]);
          return;
        }
        setProjects(data.map((p: Project) => ({
            id: p.id,
            name: p.name,
            cat: p.cat,
            status: p.status,
            year: p.year,
            thumbnail: p.thumbnail || ''
        })));
      })
      .catch(() => {
        console.error('Failed to load projects');
        setProjects([]);
      });
  }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page active">
        <div className="page-header">
          <div>
            <div className="page-title">PROJECTS</div>
            <div className="page-subtitle">CONTENT MANAGEMENT · CRUD SYSTEM</div>
          </div>
          <div className="page-actions">
            <Link href="/admin/projects/new">
                <button className="btn primary"><span>+ CREATE</span></button>
            </Link>
          </div>
        </div>

        <div className="proj-toolbar">
          <input 
            className="search-input" 
            placeholder="> SEARCH PROJECT..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <div className="filter-group">
            <button className={`filter-btn ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>ALL</button>
            <button className={`filter-btn ${filter === 'done' ? 'on' : ''}`} onClick={() => setFilter('done')}>DONE</button>
            <button className={`filter-btn ${filter === 'wip' ? 'on' : ''}`} onClick={() => setFilter('wip')}>WIP</button>
          </div>
        </div>

        <div className="proj-table-wrap">
          <table className="proj-table">
            <thead>
              <tr>
                <th>NAME</th><th>CATEGORY</th><th>STATUS</th>
                <th>YEAR</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
                {filtered.map(project => (
                    <tr key={project.id} className="proj-row">
                        <td className="proj-title">{project.name}</td>
                        <td>{project.cat.toUpperCase()}</td>
                        <td><span className={`badge ${project.status}`}>{project.status.toUpperCase()}</span></td>
                        <td>{project.year}</td>
                        <td>
                            <div className="row-actions">
                                <Link href={`/admin/projects/${project.id}`}>
                                    <button className="row-btn">EDIT</button>
                                </Link>
                                <button className="row-btn del">DEL</button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
