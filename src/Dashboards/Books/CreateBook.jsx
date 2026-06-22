import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../utils/api";
import {
    FaChevronRight, FaChevronLeft, FaUpload, FaEdit,
    FaBookOpen, FaCheckCircle, FaTrash, FaPlus,
    FaUndo, FaRedo, FaBold, FaItalic, FaUnderline,
    FaListUl, FaListOl, FaAlignLeft, FaAlignCenter,
    FaAlignRight, FaLink, FaQuoteRight, FaEllipsisV
} from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";

function CreateBook() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(1);
    const [tagInput, setTagInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [chapters, setChapters] = useState([
        { id: "ch-1", title: "Chapter 1", content: "" }
    ]);
    const [activeChapterId, setActiveChapterId] = useState("ch-1");

    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        category: "",
        subCategory: "",
        description: "",
        keywords: [],
        coverImg: null,
        coverPreview: "",
        thumbnailImg: null,
        thumbnailPreview: "",
        language: "English",
        publishType: "OFFLINE", // PAPERBACK = OFFLINE, E-BOOK = ONLINE
        pages: "",
        publishDate: "",
        tags: [],
        isDraft: true,
        content: "", // Step 2 manuscript
        price: "", // Step 3 pricing
    });


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

    const progress = [
        { step: 1, title: "Book Details", description: "Add basic information" },
        { step: 2, title: "Book Content", description: "Add your manuscript" },
        // { step: 3, title: "Pricing & Rights", description: "Set price and distribution" },
        // { step: 4, title: "Preview & Publish", description: "Review and publish" }
    ];

    // File selection handler
    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [field]: file,
                [`${field}Preview`]: URL.createObjectURL(file)
            }));
        }
    };

    // Keyword handler
    const addKeyword = () => {
        if (keywordInput.trim() && formData.keywords.length < 10) {
            setFormData(prev => ({
                ...prev,
                keywords: [...prev.keywords, keywordInput.trim()]
            }));
            setKeywordInput("");
        }
    };

    const removeKeyword = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            keywords: prev.keywords.filter((_, index) => index !== indexToRemove)
        }));
    };

    // Tag handler
    const addTag = () => {
        if (tagInput.trim() && formData.tags.length < 10) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput("");
        }
    };

    const removeTag = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, index) => index !== indexToRemove)
        }));
    };

    // Form submission mutation
    const createBookMutation = useMutation({
        mutationFn: async (submitData) => {
            const response = await api.post("/book/create", submitData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["author-books"]);
            queryClient.invalidateQueries(["dashboard"]);
            navigate("/dashboard/author/my-books");
        },
        onError: (err) => {
            setErrorMessage(err?.response?.data?.message || err?.response?.data?.error || "Failed to create book");
        }
    });

    const handleSaveAndContinue = () => {
        setErrorMessage("");

        // Basic validations per step
        if (currentStep === 1) {
            if (!formData.title || !formData.category || !formData.description) {
                setErrorMessage("Please fill in all required fields (Title, Category, Description).");
                return;
            }
            if (!formData.coverImg) {
                setErrorMessage("Please upload a cover image.");
                return;
            }
        } else if (currentStep === 2) {
            const combinedContent = chapters.map(ch => ch.content || "").join("\n");
            if (combinedContent.trim().length < 10) {
                setErrorMessage("Please add your manuscript content (minimum 10 characters).");
                return;
            }
            // Update the form data's content field with the JSON serialized chapters
            setFormData(prev => ({
                ...prev,
                content: JSON.stringify(chapters)
            }));
            // } else if (currentStep === 3) {
            //     if (formData.publishType === "ONLINE" && (!formData.price || isNaN(formData.price))) {
            //         setErrorMessage("Please specify a valid price for digital publishing.");
            //         return;
            //     }
        }

        if (currentStep < 2) {
            setCurrentStep(prev => prev + 1);
        } else {
            /* Commented out Step 4 final submit logic
            // Step 4 final submit
            const dataSubmit = new FormData();
            dataSubmit.append("title", formData.title);
            dataSubmit.append("description", formData.description);
            dataSubmit.append("category", formData.category);
            dataSubmit.append("content", formData.content);
            dataSubmit.append("publishType", formData.publishType);
            dataSubmit.append("isPublished", !formData.isDraft);

            if (formData.subtitle) dataSubmit.append("subtitle", formData.subtitle);
            if (formData.pages) dataSubmit.append("pages", parseInt(formData.pages));
            if (formData.price) dataSubmit.append("price", parseFloat(formData.price));

            // Add seoWords from tags and keywords
            const seoWords = [...formData.tags, ...formData.keywords];
            seoWords.forEach((word) => dataSubmit.append("seoWords[]", word));

            if (formData.coverImg) dataSubmit.append("coverImg", formData.coverImg);
            // Default to cover image for thumbnail if not explicitly uploaded
            if (formData.thumbnailImg) {
                dataSubmit.append("thumbnailImg", formData.thumbnailImg);
            } else if (formData.coverImg) {
                dataSubmit.append("thumbnailImg", formData.coverImg);
            }

            createBookMutation.mutate(dataSubmit);
            */
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full text-cream">
            {/* Header */}
            {/* <div className="flex flex-col items-start gap-1 w-full border-b border-border/10 pb-4">
                <h1 className="text-3xl font-bold font-playfair text-cream-dim">Create New Book</h1>
                <p className="text-brown-light text-xs font-light">
                    Bring your story to life. Add your book details and publish it for the world to read.
                </p>
            </div>
 */}
            {/* Step Wizard Bar */}
            <div className="bg-bg-secondary/40 border border-border/20 w-full flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-lg gap-4">
                {progress.map((step, index) => (
                    <div key={step.step} className="flex-1 flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-300 ${step.step === currentStep
                                ? "bg-gold text-bg-primary border-gold shadow-lg"
                                : step.step < currentStep
                                    ? "bg-gold/15 text-gold border-gold/40"
                                    : "bg-transparent text-cream-dim/30 border-border/40"
                                }`}>
                                {step.step < currentStep ? <FaCheckCircle className="text-lg" /> : step.step}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-semibold transition-colors ${step.step === currentStep ? 'text-gold' : 'text-cream-dim/60'}`}>
                                    {step.title}
                                </span>
                                <span className="text-[10px] text-cream-dim/40">{step.description}</span>
                            </div>
                        </div>
                        {index < progress.length - 1 && (
                            <FaChevronRight className="hidden md:block text-cream-dim/20 mx-4" />
                        )}
                    </div>
                ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm">
                    {errorMessage}
                </div>
            )}

            {/* Editor Body */}
            <div className="w-full">
                {currentStep === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 w-full">
                        {/* Details Panel */}
                        <div className="lg:col-span-8 bg-bg-secondary/30 border border-border/20 flex flex-col gap-6 rounded-lg p-6">
                            <h2 className="text-lg font-playfair font-bold text-gold border-b border-border/10 pb-2">Book Details</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="title" className="text-sm font-semibold text-cream">Book Title *</label>
                                        <span className="text-[10px] text-cream-dim/30">{formData.title.length}/100</span>
                                    </div>
                                    <input
                                        type="text"
                                        id="title"
                                        maxLength={100}
                                        placeholder="Enter book title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-transparent outline-none border border-border/40 focus:border-gold/50 rounded-md p-2.5 text-cream text-sm transition-colors"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="subtitle" className="text-sm font-semibold text-cream">Subtitle (Optional)</label>
                                        <span className="text-[10px] text-cream-dim/30">{formData.subtitle.length}/150</span>
                                    </div>
                                    <input
                                        type="text"
                                        id="subtitle"
                                        maxLength={150}
                                        placeholder="Enter subtitle"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="bg-transparent outline-none border border-border/40 focus:border-gold/50 rounded-md p-2.5 text-cream text-sm transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="category" className="text-sm font-semibold text-cream">Category *</label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="bg-bg-primary outline-none border border-border/40 focus:border-gold/50 rounded-md p-2.5 text-cream text-sm transition-colors"
                                    >
                                        <option value="" disabled>Select category</option>
                                        <option value="Fiction">Fiction</option>
                                        <option value="Fantasy">Fantasy</option>
                                        <option value="Mystery">Mystery</option>
                                        <option value="Sci-Fi">Sci-Fi</option>
                                        <option value="Thriller">Thriller</option>
                                        <option value="Romance">Romance</option>
                                        <option value="Historical Fiction">Historical Fiction</option>
                                        <option value="Horror">Horror</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="subCategory" className="text-sm font-semibold text-cream">Sub Category (Optional)</label>
                                    <select
                                        id="subCategory"
                                        value={formData.subCategory}
                                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                        className="bg-bg-primary outline-none border border-border/40 focus:border-gold/50 rounded-md p-2.5 text-cream text-sm transition-colors"
                                    >
                                        <option value="" disabled>Select sub category</option>
                                        <option value="Drama">Drama</option>
                                        <option value="Adventure">Adventure</option>
                                        <option value="Action">Action</option>
                                        <option value="Comedy">Comedy</option>
                                        <option value="Suspense">Suspense</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="description" className="text-sm font-semibold text-cream">Book Description *</label>
                                    <span className="text-[10px] text-cream-dim/30">{formData.description.length}/2000</span>
                                </div>
                                {/* Simple Editor Toolbar mockup */}
                                <div className="flex items-center gap-4 bg-bg-primary/60 border border-border/40 border-b-0 rounded-t-md px-3 py-1.5 text-xs text-cream-dim/50">
                                    <span className="cursor-pointer hover:text-gold font-bold">B</span>
                                    <span className="cursor-pointer hover:text-gold italic">I</span>
                                    <span className="cursor-pointer hover:text-gold underline">U</span>
                                    <span className="text-border/40">|</span>
                                    <span className="cursor-pointer hover:text-gold">List</span>
                                    <span className="cursor-pointer hover:text-gold">Quote</span>
                                    <span className="cursor-pointer hover:text-gold">Link</span>
                                </div>
                                <textarea
                                    id="description"
                                    maxLength={2000}
                                    placeholder="Write a compelling description about your book..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-transparent outline-none border border-border/40 focus:border-gold/50 rounded-b-md p-3 text-cream text-sm min-h-[140px] transition-colors"
                                />
                            </div>

                            {/* Keywords / SEO Section */}
                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex justify-between items-center">
                                    <label htmlFor="keywords" className="text-sm font-semibold text-cream">Keywords (Optional)</label>
                                    <span className="text-[10px] text-cream-dim/30">{formData.keywords.length}/10</span>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        id="keywords"
                                        placeholder="Enter keywords separated by commas"
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                                        className="bg-transparent outline-none border border-border/40 focus:border-gold/50 rounded-md p-2.5 text-cream text-sm flex-1 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={addKeyword}
                                        className="px-4 border border-gold/40 text-gold rounded-md hover:bg-gold/10 text-xs transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                                <p className="text-[10px] text-cream-dim/40 leading-none">e.g. fantasy, adventure, magic, young adult</p>
                                {formData.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {formData.keywords.map((word, index) => (
                                            <span key={index} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-semibold">
                                                {word}
                                                <button type="button" onClick={() => removeKeyword(index)} className="text-red-400 hover:text-red-500">×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Custom File Upload dropzones */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <div className="flex flex-col gap-2 w-full">
                                    <span className="text-sm font-semibold text-cream">Book Cover *</span>
                                    {formData.coverPreview ? (
                                        <div className="relative border border-border/40 rounded-lg overflow-hidden h-40 w-full group flex items-center justify-center bg-bg-secondary/20">
                                            <img src={formData.coverPreview} className="w-full h-full object-cover" alt="Cover" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, coverImg: null, coverPreview: "" })}
                                                className="absolute inset-0 bg-black/70 flex items-center justify-center text-red-400 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            >
                                                Remove Cover
                                            </button>
                                        </div>
                                    ) : (
                                        <label htmlFor="coverImg" className="border-2 border-dashed border-border/40 hover:border-gold/40 hover:bg-gold/5 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                                            <FaUpload className="text-gold text-2xl" />
                                            <span className="text-sm font-semibold text-cream">Upload Cover Image</span>
                                            <span className="text-[10px] text-cream-dim/40">JPG, PNG or WEBP. Max size 5MB.</span>
                                            <input
                                                type="file"
                                                id="coverImg"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, "coverImg")}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <span className="text-sm font-semibold text-cream">Book Thumbnail *</span>
                                    {formData.thumbnailPreview ? (
                                        <div className="relative border border-border/40 rounded-lg overflow-hidden h-40 w-full group flex items-center justify-center bg-bg-secondary/20">
                                            <img src={formData.thumbnailPreview} className="w-full h-full object-cover" alt="Thumbnail" />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, thumbnailImg: null, thumbnailPreview: "" })}
                                                className="absolute inset-0 bg-black/70 flex items-center justify-center text-red-400 font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            >
                                                Remove Thumbnail
                                            </button>
                                        </div>
                                    ) : (
                                        <label htmlFor="thumbnailImg" className="border-2 border-dashed border-border/40 hover:border-gold/40 hover:bg-gold/5 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                                            <FaUpload className="text-gold text-2xl" />
                                            <span className="text-sm font-semibold text-cream">Upload Thumbnail Image</span>
                                            <span className="text-[10px] text-cream-dim/40">JPG, PNG or WEBP. Max size 5MB.</span>
                                            <input
                                                type="file"
                                                id="thumbnailImg"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, "thumbnailImg")}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar Options Panel */}
                        <div className="lg:col-span-4 flex flex-col gap-6 w-full h-full">
                            {/* Book Information */}
                            <div className="bg-bg-secondary/30 border border-border/20 rounded-lg p-5 flex flex-col gap-4">
                                <h3 className="text-base font-playfair font-bold text-gold border-b border-border/10 pb-1.5">Book Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="pageCount" className="text-sm font-semibold text-cream">Page Count (Approx.)</label>
                                        <input
                                            type="number"
                                            id="pageCount"
                                            placeholder="e.g. 320"
                                            value={formData.pages}
                                            onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                                            className="bg-transparent outline-none border border-border/40 focus:border-gold/50 rounded p-2 text-xs text-cream transition-colors"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="publicationDate" className="text-sm font-semibold text-cream">Publication Date</label>
                                        <input
                                            type="date"
                                            id="publicationDate"
                                            value={formData.publishDate}
                                            onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                                            className="bg-transparent outline-none border border-border/40 focus:border-gold/50 rounded p-1.5 text-xs text-cream transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="bookFormat" className="text-sm font-semibold text-cream">Book Format</label>
                                        <select
                                            id="bookFormat"
                                            value={formData.publishType}
                                            onChange={(e) => setFormData({ ...formData, publishType: e.target.value })}
                                            className="bg-bg-primary outline-none border border-border/40 rounded p-2 text-xs text-cream transition-colors"
                                        >
                                            <option value="OFFLINE">Paperback</option>
                                            <option value="ONLINE">E-book</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tags Input block */}
                                <div className="flex flex-col gap-1.5 mt-2">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="tags" className="text-sm font-semibold text-cream">Tags (Optional)</label>
                                        <span className="text-[10px] text-cream-dim/30">{formData.tags.length}/10</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            id="tags"
                                            placeholder="Add tag"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                            className="bg-transparent outline-none border border-border/40 focus:border-gold/50 rounded p-2 text-xs text-cream flex-1 transition-colors"
                                        />
                                        <button type="button" onClick={addTag} className="px-3 border border-gold/40 text-gold rounded hover:bg-gold/10 text-xs font-semibold">
                                            +
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-cream-dim/40 leading-none">Press Enter to add tags</p>
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {formData.tags.map((tag, index) => (
                                                <span key={index} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-[9px] font-semibold">
                                                    {tag}
                                                    <button type="button" onClick={() => removeTag(index)} className="text-red-400 hover:text-red-500">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Visibility Card */}
                            <div className="bg-bg-secondary/30 border border-border/20 rounded-lg p-5 flex flex-col gap-3">
                                <h3 className="text-sm font-playfair font-bold text-gold border-b border-border/10 pb-1.5">Visibility</h3>
                                <p className="text-xs text-cream-dim/40 leading-none mb-1">Choose the visibility status of your book.</p>

                                <label htmlFor="publicRadio" className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${!formData.isDraft
                                    ? "bg-gold/5 border-gold/50"
                                    : "border-border/30 hover:border-gold/30"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="visibility"
                                        id="publicRadio"
                                        checked={!formData.isDraft}
                                        onChange={() => setFormData({ ...formData, isDraft: false })}
                                        className="mt-1 accent-gold"
                                    />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-semibold text-cream">Publish Now</span>
                                        <span className="text-xs text-cream-dim/50 leading-tight">Make your book live and available to readers.</span>
                                    </div>
                                </label>

                                <label htmlFor="draftRadio" className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${formData.isDraft
                                    ? "bg-gold/5 border-gold/50"
                                    : "border-border/30 hover:border-gold/30"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="visibility"
                                        id="draftRadio"
                                        checked={formData.isDraft}
                                        onChange={() => setFormData({ ...formData, isDraft: true })}
                                        className="mt-1 accent-gold"
                                    />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-semibold text-cream">Save as Draft</span>
                                        <span className="text-xs text-cream-dim/50 leading-tight">Save your book as draft and publish later.</span>
                                    </div>
                                </label>
                            </div>

                            {/* What's Next Card */}
                            <div className="bg-bg-secondary/30 border border-border/20 rounded-lg p-5 flex flex-col gap-3">
                                <h3 className="text-sm font-playfair font-bold text-gold border-b border-border/10 pb-1.5">What's Next?</h3>
                                <ul className="flex flex-col gap-3 text-sm text-cream-dim/60">
                                    <li className="flex items-start gap-2">
                                        <span className="text-gold mt-0.5">📄</span>
                                        <span>Add your manuscript in the next step</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-gold mt-0.5">🪙</span>
                                        <span>Set your pricing and royalty</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-gold mt-0.5">✅</span>
                                        <span>Review and publish your book</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
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
                )}
            </div>
            {/* {currentStep === 3 && (
                    <div className="bg-bg-secondary/30 border border-border/20 flex flex-col gap-6 rounded-lg p-6 max-w-4xl mx-auto w-full">
                        <h2 className="text-xl font-playfair font-bold text-gold border-b border-border/10 pb-2">Pricing & Rights</h2>
                        <p className="text-xs text-cream-dim/50 leading-tight">
                            Choose how you want to sell your book and specify its price.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="publishTypeSelect" className="text-xs font-semibold text-cream">Publishing Channel</label>
                                    <select
                                        id="publishTypeSelect"
                                        value={formData.publishType}
                                        onChange={(e) => setFormData({ ...formData, publishType: e.target.value })}
                                        className="bg-bg-primary outline-none border border-border/40 rounded-lg p-3 text-sm text-cream transition-colors"
                                    >
                                        <option value="ONLINE">ONLINE (E-book sales)</option>
                                        <option value="OFFLINE">OFFLINE (Physical printing only)</option>
                                    </select>
                                </div>
                                {formData.publishType === "ONLINE" && (
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="price" className="text-xs font-semibold text-cream">Set Price (INR) *</label>
                                        <input
                                            type="number"
                                            id="price"
                                            placeholder="Enter price in Rupees"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="bg-transparent outline-none border border-border/40 focus:border-gold/50 rounded-lg p-3 text-sm text-cream transition-colors"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="bg-bg-primary/40 border border-border/10 p-5 rounded-lg flex flex-col gap-3">
                                <span className="font-playfair font-bold text-gold text-sm">Royalties Calculator:</span>
                                <p className="text-[11px] text-cream-dim/60 leading-relaxed">
                                    Under E-book publishing options, you will receive <span className="text-gold font-semibold">90% royalties</span> for sales of your digital copy, minus standard transaction fees (admin platform commission is 10%).
                                </p>
                                {formData.price && !isNaN(formData.price) && formData.publishType === "ONLINE" && (
                                    <div className="border-t border-border/10 pt-3 mt-1 flex flex-col gap-1.5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-cream-dim/60">Listed Price:</span>
                                            <span className="font-semibold">₹{parseFloat(formData.price).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-green-400">
                                            <span>Your Est. Earnings (90%):</span>
                                            <span className="font-bold">₹{(parseFloat(formData.price) * 0.9).toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )} */}

            {/* {currentStep === 4 && (
                <div className="bg-bg-secondary/30 border border-border/20 flex flex-col gap-6 rounded-lg p-6 max-w-4xl mx-auto w-full">
                    <h2 className="text-xl font-playfair font-bold text-gold border-b border-border/10 pb-2">Publish & Preview</h2>
                    <p className="text-xs text-cream-dim/50 leading-tight">
                        Please review all details below. Once finalized, you can publish or save the draft.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-2">
                         Book Cover card *
                        <div className="md:col-span-1 flex flex-col items-center gap-3">
                            <div className="w-full aspect-[2/3] max-w-[200px] bg-border/20 border border-border/40 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                                {formData.coverPreview ? (
                                    <img src={formData.coverPreview} className="w-full h-full object-cover" alt="Cover Preview" />
                                ) : (
                                    <span className="text-xs text-cream-dim/20">No cover image uploaded</span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase ${formData.isDraft
                                ? "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                                : "bg-green-500/10 text-green-400 border border-green-500/20"
                                }`}>
                                {formData.isDraft ? "Draft Mode" : "Publish Mode"}
                            </span>
                        </div>

                        Info list 
                        <div className="md:col-span-2 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-cream-dim/40 leading-none">Title</span>
                                <span className="text-lg font-playfair font-semibold">{formData.title}</span>
                                {formData.subtitle && <span className="text-xs text-cream-dim/60 italic">{formData.subtitle}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs border-t border-border/10 pt-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-cream-dim/40">Category:</span>
                                    <span>{formData.category} {formData.subCategory && `(${formData.subCategory})`}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-cream-dim/40">Language & Format:</span>
                                    <span>{formData.language} - {formData.publishType === "ONLINE" ? "E-book" : "Paperback"}</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-cream-dim/40">Page Count:</span>
                                    <span>{formData.pages || "N/A"} pages</span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-cream-dim/40">Publishing Price:</span>
                                    <span>{formData.publishType === "ONLINE" ? `₹${formData.price}` : "Free / Offline"}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 border-t border-border/10 pt-4 text-xs">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-cream-dim/40">Chapters:</span>
                                        <span>{(() => {
                                            try {
                                                const parsed = JSON.parse(formData.content);
                                                return Array.isArray(parsed) ? parsed.length : 1;
                                            } catch (e) {
                                                return 1;
                                            }
                                        })()} Chapters</span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-cream-dim/40">Total Words:</span>
                                        <span>{(() => {
                                            try {
                                                const parsed = JSON.parse(formData.content);
                                                if (Array.isArray(parsed)) {
                                                    const w = parsed.reduce((sum, ch) => {
                                                        return sum + (ch.content || "").trim().split(/\s+/).filter(Boolean).length;
                                                    }, 0);
                                                    return w.toLocaleString();
                                                }
                                            } catch (e) { }
                                            return (formData.content || "").trim().split(/\s+/).filter(Boolean).length.toLocaleString();
                                        })()} Words</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-cream-dim/40">Manuscript Length:</span>
                                    <span>{(() => {
                                        try {
                                            const parsed = JSON.parse(formData.content);
                                            if (Array.isArray(parsed)) {
                                                const chars = parsed.reduce((sum, ch) => sum + (ch.content || "").length, 0);
                                                return `${chars.toLocaleString()} characters (excl. formatting)`;
                                            }
                                        } catch (e) { }
                                        return `${(formData.content || "").length.toLocaleString()} characters`;
                                    })()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )} */}


            {/* Bottom Button Bar */}
            <div className="flex items-center justify-between bg-bg-secondary/40 border border-border/20 rounded-lg p-4 w-full">
                <button
                    type="button"
                    onClick={() => {
                        if (currentStep > 1) {
                            setCurrentStep(prev => prev - 1);
                        } else {
                            navigate("/dashboard/author/my-books");
                        }
                    }}
                    className="border border-border/60 hover:bg-gold/10 hover:border-gold/30 text-cream px-6 py-2 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5"
                >
                    <FaChevronLeft className="text-[10px]" /> {currentStep === 1 ? "Cancel" : "Back"}
                </button>
                <button
                    type="button"
                    disabled={createBookMutation.isPending}
                    onClick={handleSaveAndContinue}
                    className="bg-gold hover:bg-gold-light text-bg-primary px-6 py-2 rounded-md transition-all text-xs font-bold flex items-center gap-1.5 shadow"
                >
                    {createBookMutation.isPending
                        ? "Saving..."
                        : currentStep === 2
                            ? (formData.isDraft ? "Save as Draft" : "Publish Book")
                            : "Save & Continue"
                    }
                    {currentStep < 2 && <FaChevronRight className="text-[10px]" />}
                </button>
            </div>
        </div>
    );
}

export { CreateBook };
export default CreateBook;