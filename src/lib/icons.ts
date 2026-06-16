export function icon(name: string, className = "", size = 16) {
  const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  switch (name) {
    case "search":
      return `<svg ${common} class="${className}"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
    case "chevron-left":
      return `<svg ${common} class="${className}"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
    case "chevron-right":
      return `<svg ${common} class="${className}"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    case "chevron-down":
      return `<svg ${common} class="${className}"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    case "refresh":
      return `<svg ${common} class="${className}"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a8.94 8.94 0 1 1-2.3-9.19"></path></svg>`;
    case "tv":
      return `<svg ${common} class="${className}"><rect x="2" y="6" width="20" height="14" rx="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>`;
    case "calendar":
      return `<svg ${common} class="${className}"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
    case "plus":
      return `<svg ${common} class="${className}"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
    case "soccer":
      return `<svg ${common} class="${className}"><circle cx="12" cy="12" r="9"></circle><path d="M12 3l2.3 4.6L19 9l-3 3 .7 5L12 15l-4.7 2L8 12 5 9l4.7-1.4L12 3z"></path></svg>`;
    case "dot":
      return `<svg ${common} class="${className}"><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>`;
    default:
      return "";
  }
}

export default icon;
