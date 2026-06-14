
function Welcome() {

    return (
        <>
            <div className="relative min-h-[calc(100vh-73px)] flex flex-col justify-center px-16 bg-center bg-bg-primary"
                style={{backgroundImage: "url('/src/assets/welcome-bg.jpg')"}}>

                <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/90 to transparent"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="w-10 h-px bg-gold block"></span>
                        <span className="text-xs tracking=[0.2rem] uppercase text-gold font-lora">The Publishing Platform</span>
                    </div>

                    <h1 className="text-6xl font-bold leading-[1.1] mb-4 font-playfair">Where Stories 
                        <em className="text-gold italic"> Find Their Voice</em>
                    </h1>
                    <p className="max-w-[600px] leading-relaxed mb-6 text-gold-light">Discover a world of literary wonders at your fingertips. Our platform connects authors and readers, offering a seamless experience for publishing and exploring captivating stories. Whether you're an aspiring writer or an avid reader, join us on this journey of creativity and imagination.</p>

                    <div className="flex gap-4 mt-2">
                        <button className="bg-gold text-white px-8 py-3 border-none text-base transiting-all hover:-translate-y-0.5 hover:bg-gold-light hover:shadow-[0_4px_15px_rgba(201,168,76,0.3)]">
                            Publish Now
                        </button>
                        <button className="bg-transparent border border-cream text-cream px-8 py-3 text-base transition-all hover:-translate-y-0.5 hover:bg-cream hover:text-bg-primary hover:shadow-[0_4px_15px_rgba(201,168,76,0.3)]">
                            Browse Library
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export { Welcome };


