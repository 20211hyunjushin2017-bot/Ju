import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import './App.css'

function App() {
  const [show, setShow] = useState(true)
  const [expanded, setExpanded] = useState(false)

  return (
    <main className="demo">
      <h1>Motion for React</h1>

      <section>
        <h2>First animation</h2>
        <motion.div
          className="box"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </section>

      <section>
        <h2>Enter · Hover · Tap</h2>
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          Hover / tap me
        </motion.button>
      </section>

      <section>
        <h2>Layout animation</h2>
        <motion.div
          layout
          className={expanded ? 'card expanded' : 'card'}
          onClick={() => setExpanded(!expanded)}
        >
          Click to toggle size
        </motion.div>
      </section>

      <section>
        <h2>Exit animation</h2>
        <button onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
        <AnimatePresence>
          {show ? (
            <motion.div
              key="box"
              className="box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : null}
        </AnimatePresence>
      </section>

      <section className="scroll-space">
        <h2>Scroll animation</h2>
        <motion.div
          className="box"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
        />
      </section>
    </main>
  )
}

export default App
