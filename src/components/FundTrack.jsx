/**
 * 招牌元素：資金流軌道
 * 顯示一個專案的款項狀態：已撥付（實金）與託管中（淡金）。
 */
export default function FundTrack({ released, escrow, compact = false }) {
  return (
    <div className="fund-track" role="img"
      aria-label={`已撥付 ${released}%，託管中 ${escrow}%`}>
      <div className="bar">
        <span className="seg escrow" style={{ width: '100%' }} />
        <span className="seg released" style={{ width: released + '%' }} />
      </div>
      {!compact && (
        <div className="legend">
          <span className="k-released"><i />已撥付 <b>{released}%</b></span>
          <span className="k-escrow"><i />託管中 <b>{escrow}%</b></span>
        </div>
      )}
    </div>
  )
}
