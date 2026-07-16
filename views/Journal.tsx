
import React, { useState, useRef, useEffect } from 'react';
import { JournalEntry, UserPreferences } from '../types';
import { Lock, Plus, Trash2, Book, Unlock, Save, X, Image as ImageIcon, Bold, Italic, Underline, RotateCcw, RotateCw, List, AlignLeft, Shield, AlertTriangle } from 'lucide-react';
import { t } from '../utils';

interface JournalProps {
  entries: JournalEntry[];
  addEntry: (entry: Partial<JournalEntry>) => void;
  updateEntries: (entries: JournalEntry[]) => void;
  privacyMode: boolean;
  preferences: UserPreferences;
  savePreferences: (prefs: UserPreferences) => void;
}

const Journal: React.FC<JournalProps> = ({ entries, addEntry, updateEntries, privacyMode, preferences, savePreferences }) => {
  const [view, setView] = useState<'Grid' | 'Editor'>('Grid');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  
  // Editor State
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [pageColor, setPageColor] = useState('bg-white');
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);

  // Modals
  const [showPinModal, setShowPinModal] = useState(false);
  const [modalMode, setModalMode] = useState<'CREATE_PIN' | 'UNLOCK_ENTRY' | 'LOCK_CURRENT'>('UNLOCK_ENTRY');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingEntryToUnlock, setPendingEntryToUnlock] = useState<JournalEntry | null>(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulletStyle, setBulletStyle] = useState<'none' | 'point' | 'arrow' | 'tick'>('none');

  const colors = [
      { bg: 'bg-white', label: 'White' },
      { bg: 'bg-amber-50', label: 'Parchment' },
      { bg: 'bg-stone-100', label: 'Stone' },
      { bg: 'bg-zinc-900', label: 'Dark' }
  ];

  // --- Grid & Locking Logic ---

  const handleEntryClick = (entry: JournalEntry) => {
      if (entry.isLocked) {
          setPendingEntryToUnlock(entry);
          setModalMode('UNLOCK_ENTRY');
          setPinInput('');
          setPinError('');
          setShowPinModal(true);
      } else {
          openEditor(entry);
      }
  };

  const openEditor = (entry: JournalEntry) => {
      setSelectedEntryId(entry.id);
      setTitle(entry.title);
      setHtmlContent(entry.content || '');
      setIsLocked(entry.isLocked);
      setPageColor(entry.pageColor || 'bg-white');
      setLastSaved(entry.updatedAt);
      setView('Editor');
      // Wait for render then focus
      setTimeout(() => {
          if (contentEditableRef.current) {
              contentEditableRef.current.innerHTML = entry.content || '';
          }
      }, 0);
  };

  const createNewEntry = () => {
      setSelectedEntryId(null);
      setTitle('');
      setHtmlContent('');
      setIsLocked(false);
      setPageColor('bg-white');
      setLastSaved(null);
      setView('Editor');
      setTimeout(() => {
          if (contentEditableRef.current) {
              contentEditableRef.current.innerHTML = '';
              contentEditableRef.current.focus();
          }
      }, 0);
  };

  const handlePinSubmit = () => {
      if (modalMode === 'CREATE_PIN') {
          if (pinInput.length < 4) {
              setPinError('PIN must be 4 digits.');
              return;
          }
          savePreferences({ ...preferences, journalPin: pinInput });
          setShowPinModal(false);
          // After creating PIN, lock the current entry
          setIsLocked(true);
      } else if (modalMode === 'LOCK_CURRENT') {
          // Verify PIN to lock
          if (pinInput === preferences.journalPin) {
             setIsLocked(true);
             setShowPinModal(false);
          } else {
              setPinError('Incorrect PIN');
          }
      } else if (modalMode === 'UNLOCK_ENTRY') {
          if (pinInput === preferences.journalPin) {
              setShowPinModal(false);
              if (pendingEntryToUnlock) {
                  openEditor(pendingEntryToUnlock);
                  setPendingEntryToUnlock(null);
              }
          } else {
              setPinError('Incorrect PIN');
          }
      }
  };

  const toggleLock = () => {
      if (isLocked) {
          // Unlocking
          setModalMode('UNLOCK_ENTRY'); 
          // Re-purposing UNLOCK_ENTRY logic just to verify pin before toggling state
          setPendingEntryToUnlock(null); // No pending entry, just toggling state
          setPinInput('');
          setPinError('');
          // Special inline check
          const pin = prompt("Enter PIN to unlock this entry:");
          if (pin === preferences.journalPin) {
              setIsLocked(false);
          } else {
              alert("Incorrect PIN");
          }
      } else {
          // Locking
          if (!preferences.journalPin) {
              setModalMode('CREATE_PIN');
              setPinInput('');
              setShowPinModal(true);
          } else {
              // Confirm PIN to lock
              setModalMode('LOCK_CURRENT');
              setPinInput('');
              setShowPinModal(true);
          }
      }
  };

  // --- Rich Text Editing ---

  const execCmd = (command: string, value: string | undefined = undefined) => {
      document.execCommand(command, false, value);
      if (contentEditableRef.current) {
          contentEditableRef.current.focus();
      }
  };

  const saveSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
          savedSelection.current = sel.getRangeAt(0);
      }
  };

  const restoreSelection = () => {
      const sel = window.getSelection();
      if (savedSelection.current && sel) {
          sel.removeAllRanges();
          sel.addRange(savedSelection.current);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  insertImage(ev.target.result as string);
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const insertImage = (base64: string) => {
      if (contentEditableRef.current) {
          contentEditableRef.current.focus();
          // Restore selection if we lost it (e.g. clicking file input)
          restoreSelection(); 
          
          // Legacy execCommand insertImage is simplest for cursor position
          document.execCommand('insertImage', false, base64);
          
          // Fix formatting (optional, ensure max width)
          const images = contentEditableRef.current.getElementsByTagName('img');
          const lastImage = images[images.length - 1];
          if (lastImage) {
              lastImage.style.maxWidth = '100%';
              lastImage.style.borderRadius = '8px';
              lastImage.style.marginTop = '10px';
              lastImage.style.marginBottom = '10px';
          }
      }
  };

  // --- Saving & Deleting ---

  const handleSave = () => {
      const content = contentEditableRef.current?.innerHTML || '';
      if (!title.trim() && !content.trim()) return;

      const entryData: Partial<JournalEntry> = {
          title,
          content,
          isLocked,
          pageColor,
          updatedAt: Date.now()
      };

      if (selectedEntryId) {
          const updated = entries.map(e => e.id === selectedEntryId ? { ...e, ...entryData } : e);
          updateEntries(updated);
      } else {
          addEntry(entryData);
      }
      setView('Grid');
  };

  const handleDelete = () => {
      if (selectedEntryId) {
          const updated = entries.filter(e => e.id !== selectedEntryId);
          updateEntries(updated);
          setShowDeleteConfirm(false);
          setView('Grid');
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      // "Like Word" behavior for lists
      if (e.key === 'Enter') {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              let node = range.commonAncestorContainer;
              if (node.nodeType === Node.TEXT_NODE) {
                  node = node.parentElement as Node;
              }
              const li = (node as HTMLElement).closest('li');
              
              if (li) {
                  // If in a list item and it's empty (or just has a break), outdent/exit list
                  if (li.textContent?.trim() === '') {
                      e.preventDefault();
                      execCmd('outdent');
                      return;
                  }
              } else if (bulletStyle !== 'none') {
                  // Custom bullet logic
                  e.preventDefault();
                  
                  let bulletChar = '';
                  if (bulletStyle === 'point') bulletChar = '• ';
                  if (bulletStyle === 'arrow') bulletChar = '➔ ';
                  if (bulletStyle === 'tick') bulletChar = '✓ ';

                  // Check if the current line is just the bullet (empty bullet)
                  const textContent = (node as HTMLElement).textContent || '';
                  if (textContent.trim() === bulletChar.trim()) {
                      // Remove the empty bullet
                      execCmd('delete');
                      execCmd('delete');
                      setBulletStyle('none');
                      return;
                  }

                  // Insert newline and bullet
                  execCmd('insertHTML', `<br>${bulletChar}`);
                  return;
              }
          }
      }
  };

  const toggleBullet = (style: 'none' | 'point' | 'arrow' | 'tick') => {
      if (bulletStyle === style) {
          setBulletStyle('none');
      } else {
          setBulletStyle(style);
          if (style !== 'none') {
              let bulletChar = '';
              if (style === 'point') bulletChar = '• ';
              if (style === 'arrow') bulletChar = '➔ ';
              if (style === 'tick') bulletChar = '✓ ';
              execCmd('insertText', bulletChar);
          }
      }
  };

  return (
    <div className="pb-20 space-y-6 animate-fade-in font-sans">
        
        {/* Grid View */}
        {view === 'Grid' && (
            <>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-ols-primary">{t('My Notebooks', preferences.language)}</h2>
                        <p className="text-sm text-ols-muted">{entries.length} Entries</p>
                    </div>
                    <button 
                        onClick={createNewEntry}
                        className="bg-ols-primary text-white p-3 rounded-full shadow-lg hover:bg-ols-secondary transition-colors"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <button 
                        onClick={createNewEntry}
                        className="aspect-[3/4] rounded-r-xl rounded-l-sm border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-ols-primary hover:text-ols-primary transition-colors bg-white group"
                    >
                        <Plus size={32} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold mt-2">{t('New Entry', preferences.language)}</span>
                    </button>

                    {entries.map(entry => (
                        <div 
                            key={entry.id}
                            onClick={() => handleEntryClick(entry)}
                            className={`aspect-[3/4] rounded-r-xl rounded-l-sm shadow-md cursor-pointer hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between p-4 ${entry.isLocked ? 'bg-ols-primary' : entry.pageColor}`}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/10" />
                            
                            <div className="flex justify-between items-start z-10">
                                {entry.isLocked && <Lock size={16} className="text-white/70" />}
                                <span className={`text-[10px] ml-auto ${entry.isLocked ? 'text-white/60' : 'text-gray-400'}`}>{entry.date}</span>
                            </div>

                            <div className="z-10 text-center flex-1 flex flex-col justify-center">
                                {entry.isLocked ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
                                            <Shield size={24} />
                                        </div>
                                        <h3 className="font-serif font-bold text-white tracking-widest text-sm">LOCKED</h3>
                                        <p className="text-[10px] text-white/50">PIN Required</p>
                                    </div>
                                ) : (
                                    <h3 className="font-serif font-bold text-lg leading-tight line-clamp-3 text-gray-800">
                                        {privacyMode ? 'Blur...' : entry.title || 'Untitled'}
                                    </h3>
                                )}
                            </div>
                            
                            {!entry.isLocked && (
                                <div className="line-clamp-2 text-xs text-gray-500 text-center opacity-70">
                                     {/* Strip HTML for preview */}
                                     {entry.content.replace(/<[^>]*>?/gm, '')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </>
        )}

        {/* Editor View */}
        {view === 'Editor' && (
            <div className={`rounded-2xl shadow-lg border border-gray-100 overflow-hidden min-h-[80vh] flex flex-col ${pageColor} transition-colors duration-300`}>
                
                {/* Toolbar */}
                <div className="bg-white p-2 border-b border-gray-200 flex flex-wrap gap-2 items-center sticky top-0 z-20 shadow-sm">
                    <button onClick={() => setView('Grid')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                    
                    <div className="h-6 w-px bg-gray-300 mx-1" />
                    
                    <button onClick={() => execCmd('bold')} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Bold"><Bold size={18}/></button>
                    <button onClick={() => execCmd('italic')} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Italic"><Italic size={18}/></button>
                    <button onClick={() => execCmd('underline')} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Underline"><Underline size={18}/></button>
                    
                    <div className="h-6 w-px bg-gray-300 mx-1" />
                    
                    {/* Font Size - Using native execCommand 1-7 */}
                    <select onChange={(e) => execCmd('fontSize', e.target.value)} className="bg-gray-50 border border-gray-300 rounded text-sm p-1 w-16">
                        <option value="3">12</option>
                        <option value="4">14</option>
                        <option value="5">18</option>
                        <option value="6">24</option>
                        <option value="7">36</option>
                    </select>

                    <button onClick={() => execCmd('insertUnorderedList')} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Bullet List"><List size={18}/></button>
                    
                    <div className="h-6 w-px bg-gray-300 mx-1" />

                    {/* Custom Bullets */}
                    <div className="flex items-center gap-1 bg-gray-50 rounded p-1 border border-gray-200">
                        <button onClick={() => toggleBullet('point')} className={`px-2 py-1 rounded text-sm ${bulletStyle === 'point' ? 'bg-ols-primary text-white' : 'text-gray-700 hover:bg-gray-200'}`} title="Point Bullet">•</button>
                        <button onClick={() => toggleBullet('arrow')} className={`px-2 py-1 rounded text-sm ${bulletStyle === 'arrow' ? 'bg-ols-primary text-white' : 'text-gray-700 hover:bg-gray-200'}`} title="Arrow Bullet">➔</button>
                        <button onClick={() => toggleBullet('tick')} className={`px-2 py-1 rounded text-sm ${bulletStyle === 'tick' ? 'bg-ols-primary text-white' : 'text-gray-700 hover:bg-gray-200'}`} title="Tick Bullet">✓</button>
                    </div>

                    <div className="h-6 w-px bg-gray-300 mx-1" />

                    <button onClick={() => execCmd('undo')} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Undo"><RotateCcw size={18}/></button>
                    <button onClick={() => execCmd('redo')} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Redo"><RotateCw size={18}/></button>

                    <div className="h-6 w-px bg-gray-300 mx-1" />
                    
                    <label className="p-2 hover:bg-gray-100 rounded text-gray-700 cursor-pointer" title="Insert Image">
                        <ImageIcon size={18} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>

                    <div className="flex-1" />
                    
                    {/* Colors */}
                    <div className="flex gap-1 mr-2">
                        {colors.map(c => (
                            <button 
                                key={c.bg} 
                                onClick={() => setPageColor(c.bg)}
                                className={`w-5 h-5 rounded-full border border-gray-300 ${c.bg} shadow-sm`}
                            />
                        ))}
                    </div>

                    <button 
                        onClick={toggleLock}
                        className={`p-2 rounded-full ${isLocked ? 'text-white bg-ols-primary' : 'text-gray-400 hover:bg-gray-100'}`}
                        title={isLocked ? "Unlock" : "Lock with PIN"}
                    >
                         {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                    </button>

                    {selectedEntryId && (
                         <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-red-400 hover:bg-red-50 rounded-full">
                             <Trash2 size={20} />
                         </button>
                    )}
                    
                    <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-ols-primary text-white rounded-lg font-bold hover:bg-[#3E2723] text-sm"
                    >
                        <Save size={18} /> Save
                    </button>
                </div>

                <div className="p-6 md:p-10 flex-1 flex flex-col gap-4 max-w-3xl mx-auto w-full">
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title..."
                        className={`text-3xl font-serif font-bold bg-transparent border-none focus:outline-none placeholder-gray-400 w-full ${pageColor === 'bg-zinc-900' ? 'text-white' : 'text-gray-900'}`}
                    />
                    
                    <div 
                        ref={contentEditableRef}
                        contentEditable
                        onBlur={saveSelection} 
                        onMouseUp={saveSelection}
                        onKeyUp={saveSelection}
                        onKeyDown={handleKeyDown}
                        className={`flex-1 w-full bg-transparent border-none focus:outline-none min-h-[400px] prose prose-lg max-w-none leading-relaxed focus:ring-0 ${pageColor === 'bg-zinc-900' ? 'text-gray-200 prose-headings:text-white prose-strong:text-white' : 'text-gray-800'}`}
                        style={{ outline: 'none' }}
                        data-placeholder="Start writing..."
                    />
                </div>
            </div>
        )}

        {/* PIN Modal */}
        {showPinModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-xl w-full max-w-sm text-center shadow-2xl animate-fade-in">
                    <div className="w-12 h-12 bg-ols-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={24} className="text-ols-primary" />
                    </div>
                    <h3 className="font-bold text-xl text-ols-primary mb-2">
                        {modalMode === 'CREATE_PIN' ? 'Create Secure PIN' : 'Enter PIN'}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {modalMode === 'CREATE_PIN' ? 'This PIN will be required to unlock entries.' : 'Access restricted.'}
                    </p>
                    <input 
                        type="password" 
                        value={pinInput}
                        onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
                        placeholder="****"
                        className="w-full border border-gray-300 p-3 rounded-lg mb-2 text-center text-2xl tracking-widest bg-white text-gray-900 focus:border-ols-secondary outline-none"
                        autoFocus
                        maxLength={4}
                    />
                    {pinError && <p className="text-red-500 text-sm mb-2 font-bold">{pinError}</p>}
                    <div className="flex gap-3 mt-4">
                        <button onClick={() => setShowPinModal(false)} className="flex-1 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button onClick={handlePinSubmit} className="flex-1 py-2 bg-ols-primary text-white rounded-lg font-bold">
                            {modalMode === 'CREATE_PIN' ? 'Set PIN' : 'Unlock'}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                 <div className="bg-white p-6 rounded-xl w-full max-w-sm text-center shadow-2xl animate-fade-in">
                     <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                         <AlertTriangle size={24} className="text-red-600" />
                     </div>
                     <h3 className="font-bold text-xl text-gray-900 mb-2">Delete Entry?</h3>
                     <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this journal entry? This action cannot be undone.</p>
                     <div className="flex gap-3">
                         <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Cancel</button>
                         <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Delete</button>
                     </div>
                 </div>
            </div>
        )}
    </div>
  );
};

export default Journal;
