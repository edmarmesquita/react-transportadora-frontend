import type { ReactNode } from "react"

import { motion } from "framer-motion"

type FadeInProps = {
    children: ReactNode
}

function FadeIn({ children }: FadeInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
        >
            {children}
        </motion.div>
    )
}

export default FadeIn