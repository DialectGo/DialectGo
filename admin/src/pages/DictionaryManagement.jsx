// src/pages/DictionaryManagement.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../assets/css/user-management.css';

const DictionaryManagement = () => {
    const [dataset, setDataset] = useState([]);
    const [translationPairs, setTranslationPairs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination Parameters
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 15;

    const [currentCardPage, setCurrentCardPage] = useState(1);
    const cardsPerPage = 6;
    
    // Modal & Change Request Capture States
    const [showModal, setShowModal] = useState(false);
    const [operation, setOperation] = useState('INSERT'); // INSERT, UPDATE, DELETE
    const [selectedId, setSelectedId] = useState(null);
    const [rationale, setRationale] = useState('');
    
    // Staging Data Models
    const [wordTerm, setWordTerm] = useState('');
    const [partOfSpeech, setPartOfSpeech] = useState('');
    const [definition, setDefinition] = useState('');
    const [exampleUsage, setExampleUsage] = useState('');
    const [langId, setLangId] = useState(1);

    useEffect(() => { 
        loadDatasetCollection(); 
    }, []);

    const loadDatasetCollection = async () => {
        setLoading(true);
        try {
            const {
              data: { session }
            } = await supabase.auth.getSession();

            if (!session) {
              window.location.href = '/login';
              return;
            }

            const res = await fetch('/api/dataset/dictionary', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (res.status === 401) {
              await supabase.auth.signOut();
              window.location.href = '/login';
              return;
            }

            const payload = await res.json();
            if (payload.success) {
                setDataset(payload.data);
                extractDynamicTranslationPairs(payload.data);
            }
        } catch (err) { 
            console.error("Could not sync with operational dataset:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    const extractDynamicTranslationPairs = (rawData) => {
        const pairs = [];
        
        const englishEntries = rawData.filter(item => item.language_id === 1);
        const tagalogEntries = rawData.filter(item => item.language_id === 2);
        const cebuanoEntries = rawData.filter(item => item.language_id === 3);

        englishEntries.forEach(enWord => {
            const nativeTranslations = enWord.dictionary_translations || [];
            
            const matchedTgl = tagalogEntries.find(tgl => 
                nativeTranslations.some(t => t.target_entry_id === tgl.id)
            );
            const matchedCeb = cebuanoEntries.find(ceb => 
                nativeTranslations.some(t => t.target_entry_id === ceb.id)
            );

            if (matchedTgl || matchedCeb) {
                pairs.push({
                    en: enWord,
                    tgl: matchedTgl || { word_term: '---', id: 'N/A', definition: '' },
                    ceb: matchedCeb || { word_term: '---', id: 'N/A', definition: '' }
                });
            }
        });

        if (pairs.length === 0) {
            rawData.slice(0, 15).forEach(item => {
                pairs.push({
                    en: item.language_id === 1 ? item : { word_term: '---' },
                    tgl: item.language_id === 2 ? item : { word_term: '---' },
                    ceb: item.language_id === 3 ? item : { word_term: '---' }
                });
            });
        }

        setTranslationPairs(pairs);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const {
              data: { session }
            } = await supabase.auth.getSession();

            if (!session) {
              window.location.href = '/login';
              return;
            }

            const proposedData = operation === 'DELETE' ? null : {
                language_id: Number(langId),
                word_term: wordTerm,
                part_of_speech: partOfSpeech,
                definition,
                example_usage: exampleUsage
            };

            const res = await fetch('/api/dataset/dictionary/stage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    targetTable: 'dictionary_entries',
                    operationType: operation,
                    targetRowId: selectedId,
                    proposedData,
                    rationale
                })
            });

            if (res.status === 401) {
              await supabase.auth.signOut();
              window.location.href = '/login';
              return;
            }

            const payload = await res.json();
            alert(payload.message);
            setShowModal(false);
            setRationale('');
            loadDatasetCollection();
        } catch (err) { 
            console.error("Failed transmission processing request workflow staging:", err); 
        }
    };

    const triggerExportDownload = async (format) => {
        try {
            const {
            data: { session }
            } = await supabase.auth.getSession();

            const token =
            session?.access_token;
            window.open(`/api/dataset/dictionary/export?format=${format}&token=${token}`, '_blank');
        } catch (err) { 
            console.error("Export failure stream transformation creation:", err); 
        }
    };

    const openActionModal = (type, rowObj = null) => {
        setOperation(type);
        if (rowObj) {
            setSelectedId(rowObj.id);
            setWordTerm(rowObj.word_term || '');
            setPartOfSpeech(rowObj.part_of_speech || '');
            setDefinition(rowObj.definition || '');
            setExampleUsage(rowObj.example_usage || '');
            setLangId(rowObj.language_id || 1);
        } else {
            setSelectedId(null);
            setWordTerm('');
            setPartOfSpeech('');
            setDefinition('');
            setExampleUsage('');
            setLangId(1);
        }
        setShowModal(true);
    };

    // Client-Side Pagination Computing Math Lookups
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = dataset.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(dataset.length / rowsPerPage);

    const indexOfLastCard = currentCardPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = translationPairs.slice(indexOfFirstCard, indexOfLastCard);
    const totalCardPages = Math.ceil(translationPairs.length / cardsPerPage);

    const getPaginationModelNumbers = () => {
        const pages = [];
        const maxVisibleButtons = 5;
        
        if (totalPages <= maxVisibleButtons) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, currentPage + 2);
            
            if (currentPage <= 3) {
                endPage = 5;
            } else if (currentPage >= totalPages - 2) {
                startPage = totalPages - 4;
            }
            
            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) pages.push('...');
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    if (loading) return <div style={{ padding: '40px', color: '#64748b' }}>Decompressing operational Bento metrics profiles...</div>;

    return (
        <div className="user-mgmt-container" style={{ padding: '24px' }}>
            {/* ACTION BANNER ROW */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Lexicon Dataset Management Hub</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Bento matrix tracking dataset changes via continuous multi-administrator dual-control loops.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => openActionModal('INSERT')} style={{ background: '#1a1a1a', color: '#FFD230', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>+ Add New Entry</button>
                    <button onClick={() => triggerExportDownload('json')} style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Export JSON</button>
                    <button onClick={() => triggerExportDownload('csv')} style={{ background: '#f1f5f9', color: '#334155', border: 'none', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Export CSV</button>
                </div>
            </div>

            {/* BENTO GRID MATRIX LAYOUT CONTAINER */}
            <div className="bento-layout-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                
                {/* GRID 1: DICTIONARY LANGUAGES PROFILE (3 Columns) */}
                <div className="bento-card" style={{ gridColumn: 'span 3', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>Core Languages</h3>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '16px' }}>Registered configuration target values.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {['English (ID: 1)', 'Tagalog (ID: 2)', 'Cebuano (ID: 3)'].map((l, idx) => (
                            <div key={idx} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontWeight: 700, fontSize: '0.9rem', color: '#334155' }}>{l}</div>
                        ))}
                    </div>
                </div>

                {/* GRID 2: CORE GLOSSARY DATA TRACKER (9 Columns) */}
                <div className="bento-card" style={{ gridColumn: 'span 9', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>Dictionary Entries Matrix</h3>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '16px' }}>Active terms mapped inside relational storage blocks.</p>
                        
                        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#475569', fontSize: '0.85rem' }}>
                                        <th style={{ padding: '12px' }}>Term Reference</th>
                                        <th style={{ padding: '12px' }}>POS</th>
                                        <th style={{ padding: '12px' }}>Definition Mapping</th>
                                        <th style={{ padding: '12px' }}>Actions Control</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRows.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>No database records populated yet.</td>
                                        </tr>
                                    ) : (
                                        currentRows.map(row => (
                                            <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                                                <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{row.word_term}</td>
                                                <td style={{ padding: '12px' }}><span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>{row.part_of_speech}</span></td>
                                                <td style={{ padding: '12px', color: '#475569', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.definition}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <button onClick={() => openActionModal('UPDATE', row)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', marginRight: '12px' }}>Edit</button>
                                                    <button onClick={() => openActionModal('DELETE', row)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FIXED SCALABLE PAGINATION FOOTER */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '12px' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, dataset.length)} of {dataset.length} entries
                            </span>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>Prev</button>
                                
                                {getPaginationModelNumbers().map((num, i) => (
                                    <button 
                                        key={i} 
                                        disabled={num === '...'}
                                        onClick={() => setCurrentPage(num)} 
                                        style={{ 
                                            padding: '6px 12px', 
                                            borderRadius: '6px', 
                                            border: '1px solid #e2e8f0', 
                                            backgroundColor: currentPage === num ? '#1a1a1a' : '#fff', 
                                            color: currentPage === num ? '#FFD230' : '#334155', 
                                            fontWeight: 700, 
                                            cursor: num === '...' ? 'default' : 'pointer',
                                            minWidth: '36px'
                                        }}
                                    >
                                        {num}
                                    </button>
                                ))}
                                
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>Next</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* GRID 3: DYNAMIC TRANSLATION PAIRS */}
                <div className="bento-card" style={{ gridColumn: 'span 12', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>Cross-Language Dynamic Translations</h3>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '16px' }}>Live relational intersections rendering multi-language translations side-by-side.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                        {currentCards.map((pair, idx) => (
                            <div key={idx} style={{ padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px', textAlign: 'center' }}>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', display: 'block' }}>ENGLISH</span>
                                        <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{pair.en?.word_term || '---'}</strong>
                                    </div>
                                    <div style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', display: 'block' }}>TAGALOG</span>
                                        <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{pair.tgl?.word_term || '---'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', display: 'block' }}>CEBUANO</span>
                                        <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{pair.ceb?.word_term || '---'}</strong>
                                    </div>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', fontStyle: 'italic', lineHeight: '1.4' }}>
                                    <strong>Context:</strong> {pair.en?.definition || 'No linked dynamic context available.'}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    {totalCardPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                Showing sets {indexOfFirstCard + 1} to {Math.min(indexOfLastCard, translationPairs.length)} of {translationPairs.length} mappings
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    type="button"
                                    onClick={() => setCurrentCardPage(p => Math.max(1, p - 1))} 
                                    disabled={currentCardPage === 1} 
                                    style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', cursor: currentCardPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                >
                                    Previous Sets
                                </button>
                                <span style={{ display: 'flex', alignItems: 'center', px: '4px', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                                    Page {currentCardPage} of {totalCardPages}
                                </span>
                                <button 
                                    type="button"
                                    onClick={() => setCurrentCardPage(p => Math.min(totalCardPages, p + 1))} 
                                    disabled={currentCardPage === totalCardPages} 
                                    style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', cursor: currentCardPage === totalCardPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                                >
                                    Next Sets
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DUAL-AUTHORIZATION ACTION STAGING MODAL LAYER */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <form onSubmit={handleFormSubmit} style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', width: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '8px' }}>Stage Action: <span style={{ color: operation === 'DELETE' ? '#dc2626' : operation === 'UPDATE' ? '#2563eb' : '#16a34a' }}>{operation}</span> Entry</h3>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '20px' }}>This pipeline operation requires peer review from another moderator panel member before execution.</p>

                        {operation !== 'DELETE' ? (
                            <>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Language Code Context Mapping</label>
                                <select value={langId} onChange={e => setLangId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px', background: '#fff' }}>
                                    <option value={1}>English (en)</option>
                                    <option value={2}>Tagalog (tgl)</option>
                                    <option value={3}>Cebuano (ceb)</option>
                                </select>

                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Word / Term</label>
                                <input type="text" value={wordTerm} onChange={e => setWordTerm(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px' }} />

                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Part of Speech</label>
                                <input type="text" value={partOfSpeech} onChange={e => setPartOfSpeech(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px' }} />

                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Definition Context</label>
                                <textarea value={definition} onChange={e => setDefinition(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px', height: '60px', resize: 'none' }} />

                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Example Usage</label>
                                <input type="text" value={exampleUsage} onChange={e => setExampleUsage(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px' }} />
                            </>
                        ) : (
                            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', padding: '14px', borderRadius: '8px', marginBottom: '14px', color: '#991b1b', fontSize: '0.875rem' }}>
                                <strong>Warning:</strong> You are staging a deletion request for term reference: <strong>{wordTerm}</strong> (ID: #{selectedId}).
                            </div>
                        )}

                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#f59e0b' }}>Justification / PR Rationale</label>
                        <input type="text" value={rationale} onChange={e => setRationale(e.target.value)} placeholder="Provide system auditing compliance reason..." required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }} />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                            <button type="submit" style={{ padding: '10px 20px', background: operation === 'DELETE' ? '#dc2626' : '#1a1a1a', color: operation === 'DELETE' ? '#fff' : '#FFD230', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                                Stage Request
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DictionaryManagement;