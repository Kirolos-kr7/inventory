const Loading = ({ page = false }: { page?: boolean }) => {
  return (
    <div
      className={`w-full grid place-content-center ${
        page ? "h-[500px]" : "h-40"
      }`}
    >
      <svg
        className="stroke-secondary"
        width="50px"
        height="50px"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
      >
        <circle
          cx="50"
          cy="50"
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
            values="0 50 50;360 50 50"
            keyTimes="0;1"
          />
        </circle>
      </svg>
    </div>
  )
}

export default Loading
