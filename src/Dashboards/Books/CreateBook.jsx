import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../utils/api";
import {
    FaChevronRight, FaChevronLeft, FaCheckCircle
} from "react-icons/fa";
import { BookDetailsForm } from "../../CommonComponents/BookDetailsForm";
import { ManuscriptEditor } from "../../CommonComponents/ManuscriptEditor";

function CreateBook() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(1);
    const [errorMessage, setErrorMessage] = useState("");

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
        content: "", // Step 2 manuscript
        price: "", // Step 3 pricing
        isDraft: true,
    });

    const [chapters, setChapters] = useState([
        { id: "ch-1", title: "Chapter 1", content: "" }
    ]);
    const [activeChapterId, setActiveChapterId] = useState("ch-1");

    const progress = [
        { step: 1, title: "Book Details", description: "Add basic information" },
        { step: 2, title: "Book Content", description: "Add your manuscript" },
    ];
    const { bookId } = useParams();

    // Fetch book details only if bookId exists (enabled: !!bookId)
    const { data } = useQuery({
        queryKey: ["book", bookId],
        queryFn: async () => {
            const response = await api.get(`/book/published-books/${bookId}`);
            return response.data.data.data;
        },
        enabled: !!bookId,
    });

    // Sync fetched book details with state without infinite loops
    useEffect(() => {
        if (data?.book) {
            const book = data.book;
            setFormData({
                title: book.title || "",
                subtitle: book.subtitle || "",
                category: book.category || "",
                subCategory: book.subCategory || "",
                description: book.description || "",
                keywords: book.seoWords || [],
                coverImg: null, // Keep file null initially since we have preview URL
                coverPreview: book.coverImg || "",
                thumbnailImg: null,
                thumbnailPreview: book.thumbnailImg || "",
                language: book.language || "English",
                publishType: book.publishType || "OFFLINE",
                pages: book.pages || "",
                publishDate: book.publishDate || "",
                tags: book.tags || [],
                content: book.content || "",
                isDraft: !book.isPublished,
            });

            // Parse chapters safely if stored
            if (book.content) {
                try {
                    const parsed = JSON.parse(book.content);
                    if (Array.isArray(parsed)) {
                        setChapters(parsed);
                        if (parsed.length > 0) {
                            setActiveChapterId(parsed[0].id);
                        }
                    }
                } catch (err) {
                    console.warn("Content is not in JSON chapter format. Loading as plain text into Chapter 1.", err);
                    // Fallback to placing raw string into Chapter 1
                    setChapters([
                        { id: "ch-1", title: "Chapter 1", content: book.content }
                    ]);
                    setActiveChapterId("ch-1");
                }
            }
        }
    }, [data]);

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

    const editBookMutation = useMutation({
        mutationFn: async (submitData) => {
            const response = await api.put(`/book/update/${bookId}`, submitData, {
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
            setErrorMessage(err?.response?.data?.message || err?.response?.data?.error || "Failed to edit book");
        }
    })
    const handleSaveAndContinue = () => {
        setErrorMessage("");

        // Basic validations per step
        if (currentStep === 1) {
            if (!formData.title || !formData.category || !formData.description) {
                setErrorMessage("Please fill in all required fields (Title, Category, Description).");
                return;
            }
            if (!formData.coverImg && !formData.coverPreview) {
                setErrorMessage("Please upload a cover image.");
                return;
            }
        } else if (currentStep === 2) {
            const combinedContent = chapters.map(ch => ch.content || "").join("\n");
            if (combinedContent.trim().length < 10) {
                setErrorMessage("Please add your manuscript content (minimum 10 characters).");
                return;
            }
            const serializedContent = JSON.stringify(chapters);
            // Update the form data's content field with the JSON serialized chapters
            setFormData(prev => ({
                ...prev,
                content: serializedContent
            }));
        }

        if (currentStep < 2) {
            setCurrentStep(prev => prev + 1);
        } else {
            const dataSubmit = new FormData();
            dataSubmit.append("title", formData.title);
            dataSubmit.append("description", formData.description);
            dataSubmit.append("category", formData.category);
            dataSubmit.append("content", JSON.stringify(chapters));
            dataSubmit.append("publishType", formData.publishType);

            if (formData.pages) dataSubmit.append("pages", parseInt(formData.pages));
            if (formData.price) dataSubmit.append("price", parseFloat(formData.price));

            // Add seoWords from tags and keywords
            const seoWords = [...formData.tags, ...formData.keywords];
            seoWords.forEach((word) => dataSubmit.append("seoWords", word));

            if (formData.coverImg) dataSubmit.append("coverImg", formData.coverImg);
            // Default to cover image for thumbnail if not explicitly uploaded
            if (formData.thumbnailImg) {
                dataSubmit.append("thumbnailImg", formData.thumbnailImg);
            } else if (formData.coverImg) {
                dataSubmit.append("thumbnailImg", formData.coverImg);
            }

            if (bookId) {
                editBookMutation.mutate(dataSubmit);
            } else {
                createBookMutation.mutate(dataSubmit);
            }

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
                    <BookDetailsForm formData={formData} setFormData={setFormData} />
                )}

                {currentStep === 2 && (
                    <ManuscriptEditor
                        chapters={chapters}
                        setChapters={setChapters}
                        setErrorMessage={setErrorMessage}
                        activeChapterId={activeChapterId}
                        setActiveChapterId={setActiveChapterId} />
                )}
            </div>

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
                    disabled={createBookMutation.isPending || editBookMutation.isPending}
                    onClick={handleSaveAndContinue}
                    className="bg-gold hover:bg-gold-light text-bg-primary px-6 py-2 rounded-md transition-all text-xs font-bold flex items-center gap-1.5 shadow"
                >
                    {createBookMutation.isPending || editBookMutation.isPending
                        ? "Saving..."
                        : currentStep === 2 ?
                            "Save as Draft" : "Save & Continue"
                    }
                    {currentStep < 2 && <FaChevronRight className="text-[10px]" />}
                </button>
            </div>
        </div>
    );
}

export default CreateBook;