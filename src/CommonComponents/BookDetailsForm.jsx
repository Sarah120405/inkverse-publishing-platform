import { useState } from "react";
import { FaPlus, FaUpload } from "react-icons/fa";

function BookDetailsForm({ formData, setFormData }) {
    const [tagInput, setTagInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");


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

    return (
        <>

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
                                maxLength={30}
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


        </>
    )
}

export { BookDetailsForm }; 