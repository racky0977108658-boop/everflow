import { Link } from 'react-router-dom'
import FundTrack from './FundTrack.jsx'
import { fmt, escrowSplit } from '../data/seed.js'

export default function ProjectCard({ p }) {
  const split = escrowSplit(p)
  const pctOfGoal = Math.round((p.raised / p.goal) * 100)
  return (
    <Link to={`/project/${p.slug}`} className="card rise">
      <div className="cover">
        <span className="cover-art" aria-hidden="true">{p.cover}</span>
        <span className="cat">{p.category}</span>
      </div>
      <div className="body">
        <h3>{p.title}</h3>
        <div className="verify">
          {p.verified.map((v) => (
            <span key={v} className={'badge' + (v === '原創已驗證' ? ' gold' : '')}>{v}</span>
          ))}
        </div>
        <div className="facts">
          <span className="amt">{fmt(p.raised)}</span>
          <span>{pctOfGoal}% 達成・{p.backers} 人贊助・剩 {p.days_left} 天</span>
        </div>
        <FundTrack released={split.released} escrow={split.escrow} />
      </div>
    </Link>
  )
}
