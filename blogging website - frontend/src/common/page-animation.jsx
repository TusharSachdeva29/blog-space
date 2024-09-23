import { motion } from "framer-motion";

const AnimationWrapper = ({
    children,
    keyValue,
    initial = { opacity: 0 },
    animate = { opacity: 1 },
    transition = { duration: 1 },
    className = ""  // Define className with a default empty string
}) => {
    return (
        <motion.div
            key={keyValue}
            initial={initial}
            animate={animate}
            transition={transition}
            className={className}  // Use the className prop
        >
            {children}
        </motion.div>
    );
}

export default AnimationWrapper;
