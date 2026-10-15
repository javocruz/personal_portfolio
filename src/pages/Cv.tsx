import { useState } from 'react'
import { motion } from 'motion/react'
import { useI18n } from '../lib/i18n'
import { useHead } from '../lib/head'
import { reveal } from '../lib/motion'
import type { UIKey } from '../content/ui'

const versions: { file: string; name: UIKey; desc: UIKey }[] = [
  { file: 'Javier_Cruz_CV_AIxX.pdf', name: 'cv.aixx.name', desc: 'cv.aixx.desc' },
  { file: 'Javier_Cruz_CV_FDE.pdf', name: 'cv.fde.name', desc: 'cv.fde.desc' },
  { file: 'Javier_Cruz_CV.pdf', name: 'cv.general.name', desc: 'cv.general.desc' },
]

export default function Cv() {
  const { t } = useI18n()
  const [cur, setCur] = useState(versions[0].file)
  useHead('CV — Javier Cruz Villarreal', t('cv.sub'))
  return (
    <main className="blog cv">
      <header className="blog-head">
        <p className="mono dim">{t('nav.cv')}</p>
        <h1>{t('cv.title')}</h1>
        <p>{t('cv.sub')}</p>
      </header>
      <div className="cv-grid">
        {versions.map((v) => (
          <motion.div key={v.file} className={`cv-card ${cur === v.file ? 'on' : ''}`} {...reveal}>
            <h3>{t(v.name)}</h3>
            <p>{t(v.desc)}</p>
            <div className="cta">
              <a className="btn solid" href={`/cv/${v.file}`} download>{t('cv.download')}</a>
              <button className="btn" onClick={() => setCur(v.file)}>{t('cv.preview')}</button>
            </div>
          </motion.div>
        ))}
      </div>
      <iframe className="cv-frame" title="CV preview" src={`/cv/${cur}#view=FitH&toolbar=0`} />
      <p className="mono dim"><a href={`/cv/${cur}`} target="_blank" rel="noreferrer">{t('cv.open')} ↗</a></p>
    </main>
  )
}
