import { FaFilter, FaCheck, FaStar } from "react-icons/fa";

function BookFilters({ className, minPrice, setMinPrice, maxPrice, setMaxPrice, rating, setRating, format, setFormat, pages, setPages }) {
    return (
        <div id='filter' className={className}>
            {/* Filter */}

            <div className='flex items-center justify-between'>
                <h3 className='text-lg font-semibold text-cream-dim/80'>Filter Books</h3>
                <FaFilter className='text-gold' />
            </div>
            <div className='flex flex-col gap-2 p-1'>
                <label htmlFor='category' className='text-xs font-semibold text-cream-dim/50 uppercase tracking-wider mb-2 font-sans'>Category</label>
                <select className='text-xs text-cream-dim/70 bg-bg-primary w-full text-sm text-cream-dim/70 border border-border/40 rounded-md px-2 py-1'>
                    <option value='all'>All Categories</option>
                    <option value='author'>Author</option>
                </select>
            </div>
            <hr className='w-full text-cream-dim/50 px-1' />
            <div className='flex flex-col gap-2 p-1'>
                <label className='text-xs font-semibold text-cream-dim/50 uppercase tracking-wider mb-2 font-sans'>
                    Price Range
                </label>
                <div className='relative w-full h-6 flex items-center mt-2'>
                    {/* Background track line */}
                    <div className='absolute left-0 right-0 h-1 bg-border/20 rounded-full' />

                    {/* Highlight line between thumbs */}
                    <div
                        className='absolute h-1 bg-gold rounded-full'
                        style={{
                            left: `${(minPrice / 700) * 100}%`,
                            right: `${100 - (maxPrice / 700) * 100}%`
                        }}
                    />
                    {/* Minimum Price Slider Input */}
                    <input
                        type='range'
                        min={0}
                        max={700}
                        step={10}
                        value={minPrice}
                        onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 10))}
                        className='absolute w-full pointer-events-none appearance-none bg-transparent h-1 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-pointer'
                    />

                    {/* Maximum Price Slider Input */}
                    <input
                        type='range'
                        min={0}
                        max={700}
                        step={10}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 10))}
                        className='absolute w-full pointer-events-none appearance-none bg-transparent h-1 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:cursor-pointer'
                    />
                </div>
                <div className='flex justify-between items-center text-xs text-gold mt-1'>
                    <span>₹{minPrice}</span>
                    <span>₹{maxPrice}</span>
                </div>
            </div>
            <hr className='w-full text-cream-dim/50' />
            <div className='flex flex-col gap-2.5 p-1'>
                <label className='text-xs font-semibold text-cream-dim/50 uppercase tracking-wider mb-1 font-sans'>
                    Rating
                </label>
                <div className='flex flex-col gap-2.5'>
                    {
                        [5, 4, 3, 2, 1].map(
                            (star, index) => (
                                <label key={index} className='flex items-center gap-3 cursor-pointer group'>
                                    <div className='relative w-4 h-4 flex items-center justify-center flex-shrink-0'>
                                        <input
                                            type='checkbox'
                                            className='sr-only peer'
                                            onChange={() => setRating(star)}
                                        />
                                        <div className='w-full h-full rounded border border-gold/30 bg-bg-primary flex items-center justify-center transition-all duration-200 group-hover:border-gold/60 peer-checked:border-gold peer-checked:bg-gold/15' />
                                        <FaCheck className='absolute text-[8px] text-gold scale-0 peer-checked:scale-100 transition-transform duration-200 pointer-events-none' />
                                    </div>
                                    <div className='flex items-center gap-1 text-sm text-cream-dim/60 font-sans select-none'>
                                        <div className='flex items-center gap-0.5'>
                                            {/* Active Gold Stars */}
                                            {Array.from({ length: star }, (_, i) => (
                                                <FaStar key={`gold-${i}`} className='text-gold text-sm' />
                                            ))}
                                            {/* Inactive Dim Stars */}
                                            {Array.from({ length: 5 - star }, (_, i) => (
                                                <FaStar key={`dim-${i}`} className='text-cream-dim/10 text-sm' />
                                            ))}
                                        </div>
                                        <span className='ml-1 text-xs text-cream-dim/50 lowercase tracking-normal font-sans'>& up</span>
                                    </div>
                                </label>
                            )
                        )
                    }
                </div>
            </div>
            <hr className='w-full text-cream-dim/50' />
            <div className='flex flex-col gap-2.5 p-1'>
                <label className='text-xs font-semibold text-cream-dim/50 uppercase tracking-wider mb-1 font-sans'>
                    Format
                </label>
                <div className='flex flex-col gap-2.5'>
                    {
                        ['Hardcover', 'Paperback', 'E-book'].map(
                            (format, index) => (
                                <label key={index} className='flex items-center gap-3 cursor-pointer group'>
                                    <div className='relative w-4 h-4 flex items-center justify-center flex-shrink-0'>
                                        <input
                                            type='checkbox'
                                            className='sr-only peer'
                                            onChange={() => setFormat(format)}
                                        />
                                        <div className='w-full h-full rounded border border-gold/30 bg-bg-primary flex items-center justify-center transition-all duration-200 group-hover:border-gold/60 peer-checked:border-gold peer-checked:bg-gold/15' />
                                        <FaCheck className='absolute text-[8px] text-gold scale-0 peer-checked:scale-100 transition-transform duration-200 pointer-events-none' />
                                    </div>
                                    <span className='text-xs text-cream-dim/70 group-hover:text-cream transition-colors font-sans select-none'>
                                        {format}
                                    </span>
                                </label>
                            )
                        )
                    }
                </div>
            </div>
            <hr className='w-full text-cream-dim/50' />
            <div className='flex flex-col gap-2 p-1'>
                <label htmlFor='pages' className='text-xs font-semibold text-cream-dim/50 uppercase tracking-wider mb-2 font-sans' >Pages</label>
                <select
                    onChange={(e) => setPages(e.target.value)}
                    className='w-full border text-xs text-cream-dim/70 bg-bg-primary border-border/40 rounded-md px-2 py-1'
                >
                    <option value='quick'>Quick Reads (&lt;150 pages)</option>
                    <option value='standard'>Standard Reads (150-300 pages)</option>
                    <option value='epic'>Epic Reads (300-500 pages)</option>
                    <option value='legendary'>Legendary (500+ pages)</option>
                </select>
            </div>
            <div className='flex flex-col gap-4'>
                <button className='w-full bg-gold/90 text-bg-primary rounded-md py-2 hover:bg-gold/40 transition-all duration-300'>Apply Filters</button>
                <button
                    onClick={() => {
                        setFormat(null);
                        setPages(null);
                        setMinPrice(0);
                        setMaxPrice(700);
                        setRating(null);
                        setSort(null);
                    }}
                    className='w-full text-cream-dim/90 border border-gold/40 rounded-md hover:text-gold hover:border-gold duration-300 text-center cursor-pointer py-2'>Clear Filters</button>
            </div>

        </div>
    )
}

export { BookFilters };