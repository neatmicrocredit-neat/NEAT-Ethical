'use client'

import {motion} from 'motion/react';


export const AnimatableParent = ({ children, variants }) => {
    return <motion.div initial="initial" whileHover="hover" variants={variants}>{children}</motion.div>
}

export const AnimatableChild = ({ children, variants }) => {
    return(
        <motion.span variants={variants}>{children}</motion.span>
    )
}

