const Loader = ({ width = 50 }: { width?: number }) => {
  return (
    <svg
      className="stroke-secondary"
      width={width + "px"}
      height={width + "px"}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <circle
        cx={width}
        cy={width}
        fill="none"
        strokeWidth="10"
        r="35"
        strokeDasharray="164.93361431346415 56.97787143782138"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          repeatCount="indefinite"
          dur="1s"
          values={`0 ${width} ${width};360 ${width} ${width}`}
          keyTimes="0;1"
        />
      </circle>
    </svg>
  )
}

export default Loader
