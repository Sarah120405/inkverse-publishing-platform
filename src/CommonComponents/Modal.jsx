import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

function Modal({ children, open, close }) {


    const modal_root = document.getElementById("modal-root");

    return createPortal(
        <AnimatePresence>
            {open && <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={close}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 backdrop-blur-sm">

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full max-w-[480px]"
                    onClick={(e) => e.stopPropagation()}

                >
                    <div className="mb-4">{children}</div>
                </motion.div>
            </motion.div>}
        </AnimatePresence>
        , modal_root
    )
}

export { Modal };