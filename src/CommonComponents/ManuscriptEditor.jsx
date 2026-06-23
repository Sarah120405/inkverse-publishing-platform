import {
    FaUpload, FaTrash, FaPlus,
    FaUndo, FaRedo, FaBold, FaItalic, FaUnderline,
    FaListUl, FaListOl, FaAlignLeft, FaAlignCenter,
    FaAlignRight, FaLink, FaQuoteRight, FaEllipsisV
} from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";

function ManuscriptEditor({ chapters, setChapters, activeChapterId, setActiveChapterId, setErrorMessage }) {
    // Helper to calculate statistics dynamically across all chapters

    const getStats = () => {
        let words = 0;
        let characters = 0;
        let paragraphs = 0;
        let sentences = 0;

        chapters.forEach(ch => {
            const text = ch.content || "";
            characters += text.length;
            words += text.trim().split(/\s+/).filter(Boolean).length;
            paragraphs += text.split(/\n\s*\n/).filter(Boolean).length;
            sentences += text.split(/[.!?]+/).filter(Boolean).length;
        });

        const pages = Math.ceil(words / 275);
        const readingTimeMin = Math.ceil(words / 200);
        const readingTime = readingTimeMin >= 60
            ? `${Math.floor(readingTimeMin / 60)}h ${readingTimeMin % 60}m`
            : `${readingTimeMin}m`;

        return { words, characters, pages, readingTime, paragraphs, sentences };
    };

    const stats = getStats();
    const activeChapter = chapters.find(ch => ch.id === activeChapterId) || chapters[0] || { id: "ch-1", title: "Chapter 1", content: "" };

    const handleUpdateActiveChapter = (updatedFields) => {
        setChapters(prev => prev.map(ch =>
            ch.id === activeChapterId ? { ...ch, ...updatedFields } : ch
        ));
    };

    const handleAddChapter = () => {
        const newId = `ch-${Date.now()}`;
        const newIndex = chapters.length + 1;
        const newChapter = {
            id: newId,
            title: `Chapter ${newIndex}`,
            content: ""
        };
        setChapters(prev => [...prev, newChapter]);
        setActiveChapterId(newId);
    };

    const handleDeleteChapter = (idToDelete, e) => {
        e.stopPropagation();
        if (chapters.length <= 1) {
            setErrorMessage("You must have at least one chapter.");
            return;
        }

        const indexToDelete = chapters.findIndex(ch => ch.id === idToDelete);
        let nextActiveId = activeChapterId;
        if (activeChapterId === idToDelete) {
            const nextActiveChapter = chapters[indexToDelete - 1] || chapters[indexToDelete + 1];
            nextActiveId = nextActiveChapter.id;
        }

        setChapters(prev => prev.filter(ch => ch.id !== idToDelete));
        setActiveChapterId(nextActiveId);
    };

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.name.endsWith(".txt")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                handleUpdateActiveChapter({ content: text });
            };
            reader.readAsText(file);
        } else {
            alert("Only plain text (.txt) files are supported for import directly in this prototype. For .docx and .pdf files, copy-paste your manuscript.");
        }
    };


    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-12 items-start gap-6 w-full">
                {/* Left Column: Manuscript Editor */}
                <div className="lg:col-span-8 bg-bg-secondary/30 border border-border/20 flex flex-col gap-4 rounded-lg p-6 w-full">
                    <div className="flex flex-col gap-1 w-full border-b border-border/10 pb-4">
                        <h2 className="text-xl font-bold font-playfair text-gold">Manuscript Editor</h2>
                        <p className="text-[11px] text-cream-dim/40 font-light leading-none">
                            Write or paste your book content below.
                        </p>
                    </div>

                    {/* Toolbar actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-bg-primary/50 border border-border/30 rounded-t-lg px-4 py-2 text-xs">
                        <div className="flex items-center gap-3">
                            {/* Import File with invisible file input */}
                            <label className="border border-gold/40 hover:bg-gold/10 text-gold px-3 py-1.5 rounded text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all">
                                <FaUpload className="text-xs" /> Import File
                                <input
                                    type="file"
                                    accept=".txt"
                                    onChange={handleImportFile}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-border/40">|</span>
                            <button
                                type="button"
                                title="Undo"
                                className="text-cream-dim/60 hover:text-gold transition-colors p-1"
                            >
                                <FaUndo />
                            </button>
                            <button
                                type="button"
                                title="Redo"
                                className="text-cream-dim/60 hover:text-gold transition-colors p-1"
                            >
                                <FaRedo />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <select className="bg-bg-primary border border-border/40 text-cream text-[11px] px-2 py-1 rounded outline-none focus:border-gold/30">
                                <option value="normal">Normal Text</option>
                                <option value="h1">Heading 1</option>
                                <option value="h2">Heading 2</option>
                                <option value="h3">Heading 3</option>
                            </select>
                        </div>
                    </div>

                    {/* Formatting style keys */}
                    <div className="flex items-center gap-3 bg-bg-primary/30 border border-border/30 border-t-0 px-4 py-1.5 text-xs text-cream-dim/50">
                        <button type="button" title="Bold" className="cursor-pointer hover:text-gold font-bold p-1"><FaBold /></button>
                        <button type="button" title="Italic" className="cursor-pointer hover:text-gold italic p-1"><FaItalic /></button>
                        <button type="button" title="Underline" className="cursor-pointer hover:text-gold underline p-1"><FaUnderline /></button>
                        <span className="text-border/40">|</span>
                        <button type="button" title="Bullet List" className="cursor-pointer hover:text-gold p-1"><FaListUl /></button>
                        <button type="button" title="Numbered List" className="cursor-pointer hover:text-gold p-1"><FaListOl /></button>
                        <span className="text-border/40">|</span>
                        <button type="button" title="Align Left" className="cursor-pointer hover:text-gold p-1"><FaAlignLeft /></button>
                        <button type="button" title="Align Center" className="cursor-pointer hover:text-gold p-1"><FaAlignCenter /></button>
                        <button type="button" title="Align Right" className="cursor-pointer hover:text-gold p-1"><FaAlignRight /></button>
                        <span className="text-border/40">|</span>
                        <button type="button" title="Insert Link" className="cursor-pointer hover:text-gold p-1"><FaLink /></button>
                        <button type="button" title="Blockquote" className="cursor-pointer hover:text-gold p-1"><FaQuoteRight /></button>
                    </div>

                    {/* Editor workspace */}
                    <div className="flex flex-col gap-2 w-full relative">
                        <div className="flex flex-col gap-1 w-full border-b border-border/10 pb-2">
                            <input
                                type="text"
                                value={activeChapter.title}
                                onChange={(e) => handleUpdateActiveChapter({ title: e.target.value })}
                                placeholder="Enter chapter title"
                                className="bg-transparent text-cream font-semibold text-base outline-none focus:text-gold transition-colors w-full"
                            />
                        </div>
                        <textarea
                            placeholder="Start writing or paste your chapter content here..."
                            value={activeChapter.content}
                            onChange={(e) => handleUpdateActiveChapter({ content: e.target.value })}
                            className="bg-transparent outline-none border border-border/30 focus:border-gold/50 rounded-b-md p-4 text-cream text-sm min-h-[400px] leading-relaxed transition-colors w-full resize-y"
                        />
                        <span className="absolute bottom-3 right-4 text-[10px] text-cream-dim/30 pointer-events-none select-none">
                            {activeChapter.content ? activeChapter.content.trim().split(/\s+/).filter(Boolean).length : 0} words
                        </span>
                    </div>

                    <p className="text-[10px] text-cream-dim/40 flex items-center gap-1 mt-1 font-light">
                        <span className="text-gold">💡</span> Tip: You can import your manuscript from .docx, .txt, or .pdf files.
                    </p>
                </div>

                {/* Right Column: Sidebar Statistics & Chapter Structure */}
                <div className="lg:col-span-4 flex flex-col gap-6 w-full h-full">
                    {/* Book Statistics Card */}
                    <div className="bg-bg-secondary/30 border border-border/20 rounded-lg p-5 flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-border/10 pb-2">
                            <IoStatsChart className="text-gold text-lg" />
                            <h3 className="text-sm font-playfair font-bold text-gold">Book Statistics</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-bg-primary/40 border border-border/10 rounded-lg p-3 flex flex-col gap-0.5">
                                <span className="text-[9px] text-cream-dim/40 font-semibold uppercase tracking-wider">Words</span>
                                <span className="text-lg font-bold text-cream">{stats.words.toLocaleString()}</span>
                            </div>
                            <div className="bg-bg-primary/40 border border-border/10 rounded-lg p-3 flex flex-col gap-0.5">
                                <span className="text-[9px] text-cream-dim/40 font-semibold uppercase tracking-wider">Characters</span>
                                <span className="text-lg font-bold text-cream">{stats.characters.toLocaleString()}</span>
                            </div>
                            <div className="bg-bg-primary/40 border border-border/10 rounded-lg p-3 flex flex-col gap-0.5">
                                <span className="text-[9px] text-cream-dim/40 font-semibold uppercase tracking-wider">Pages (Est.)</span>
                                <span className="text-lg font-bold text-cream">{stats.pages}</span>
                            </div>
                            <div className="bg-bg-primary/40 border border-border/10 rounded-lg p-3 flex flex-col gap-0.5">
                                <span className="text-[9px] text-cream-dim/40 font-semibold uppercase tracking-wider">Reading Time</span>
                                <span className="text-lg font-bold text-cream">{stats.readingTime}</span>
                            </div>
                            <div className="bg-bg-primary/40 border border-border/10 rounded-lg p-3 flex flex-col gap-0.5">
                                <span className="text-[9px] text-cream-dim/40 font-semibold uppercase tracking-wider">Paragraphs</span>
                                <span className="text-lg font-bold text-cream">{stats.paragraphs}</span>
                            </div>
                            <div className="bg-bg-primary/40 border border-border/10 rounded-lg p-3 flex flex-col gap-0.5">
                                <span className="text-[9px] text-cream-dim/40 font-semibold uppercase tracking-wider">Sentences</span>
                                <span className="text-lg font-bold text-cream">{stats.sentences}</span>
                            </div>
                        </div>

                        {/* Goal card progress */}
                        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-border/10 text-xs">
                            <div className="flex items-start gap-2 text-cream-dim/70 leading-tight">
                                <span className="text-gold mt-0.5">🎯</span>
                                <p>Great progress! Aim for 50,000+ words for a complete book.</p>
                            </div>
                            <div className="flex justify-between items-center text-[10px] mt-1">
                                <span className="text-cream-dim/60">Completion Target</span>
                                <span className="text-gold font-semibold">{Math.min(100, Math.round((stats.words / 50000) * 100))}%</span>
                            </div>
                            <div className="w-full bg-border/20 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-gold h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.round((stats.words / 50000) * 100))}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Chapter Structure Card */}
                    <div className="bg-bg-secondary/30 border border-border/20 rounded-lg p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-border/10 pb-2">
                            <h3 className="text-sm font-playfair font-bold text-gold">Chapter Structure</h3>
                            <button
                                type="button"
                                onClick={handleAddChapter}
                                className="text-[11px] text-gold font-semibold hover:underline flex items-center gap-1"
                            >
                                + Add Chapter
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 max-h-[130px] overflow-y-auto scrollbar-none pr-1">
                            {chapters.map((ch, idx) => {
                                const chWords = (ch.content || "").trim().split(/\s+/).filter(Boolean).length;
                                const isSelected = ch.id === activeChapterId;
                                return (
                                    <div
                                        key={ch.id}
                                        onClick={() => setActiveChapterId(ch.id)}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                            ? "bg-gold/5 border-gold/50 shadow-sm"
                                            : "border-border/30 hover:border-gold/20"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <span className="text-cream-dim/20 select-none cursor-grab"><FaEllipsisV className="text-[10px]" /></span>
                                            <span className={`text-xs font-semibold truncate ${isSelected ? "text-gold" : "text-cream-dim/80"}`}>
                                                {ch.title || `Chapter ${idx + 1}`}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-cream-dim/40 whitespace-nowrap">
                                                {chWords.toLocaleString()} words
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteChapter(ch.id, e)}
                                                title="Delete Chapter"
                                                className="text-cream-dim/30 hover:text-red-400 p-1 transition-colors"
                                            >
                                                <FaTrash className="text-[10px]" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddChapter}
                            className="border-2 border-dashed border-border/30 hover:border-gold/40 hover:bg-gold/5 rounded-lg p-2.5 flex items-center justify-center gap-1.5 text-xs text-gold font-semibold cursor-pointer transition-all mt-1"
                        >
                            <FaPlus className="text-[10px]" /> Add New Chapter
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export { ManuscriptEditor };