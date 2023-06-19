export const zoomIn = {
  hide: {
    opacity: 0,
    transform: "translate(-50%,-50%) scale(0.8)",
  },
  show: {
    opacity: 1,
    transform: "translate(-50%,-50%) scale(1)",
  },
}

export const fadeIn = {
  hide: {
    opacity: 0,
  },
  show: {
    opacity: 1,
  },
}

export const slideDown = {
  hide: {
    transform: "translate(-50%,-500px)",
  },
  show: {
    transform: "translate(-50%,0)",
  },
}

export const slideUp = {
  hide: {
    transform: "translate(0,50px)",
  },
  show: {
    transform: "translate(0,0)",
  },
}
