import { fadeIn, zoomIn } from "@/utils/motion"
import { motion, AnimatePresence } from "framer-motion"
import { ReactElement } from "react"

const Dialog = ({
  open,
  header,
  body,
  close,
}: {
  open: boolean
  header: string | ReactElement
  body: ReactElement
  close?: () => void
}) => {
  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              variants={zoomIn}
              initial="hide"
              animate="show"
              exit="hide"
              transition={{
                type: "spring",
                duration: "0.5",
              }}
              className="modal-box fixed top-1/2 left-1/2 w-[calc(100%-24px)] sm:w-full border border-base-300 shadow-md md:min-w-[480px] z-40"
            >
              <h3 className="text-2xl font-bold">{header}</h3>
              <div className="pt-4">{body}</div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="hide"
              animate="show"
              exit="hide"
              className="inset-0 bg-base-100/40 backdrop-blur-[2px] absolute z-[39]"
              onClick={close}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Dialog
