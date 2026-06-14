import { FaFeatherAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Logo() {

    return (
        <Link className='flex items-center gap-3 cursor-pointer select-none no-underline' to="/">
            <div className=''>
                <FaFeatherAlt size={32} className='text-gold -rotate-12' />
            </div>
            <div className='flex flex-col'>
                <h1 className='font-playfair text-xl font-bold tracking-wider text-gold leading-none'>Inkverse</h1>
                <p className='text-[10px] tracking-[0.2em] text-cream/70 uppercase leading-none mt-1'>Publishing</p>
            </div>
        </Link>
    )
}

export { Logo };