// Ícones simples em SVG (sem biblioteca externa). Herdam a cor do texto.

function Icon({ size = 20, children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IconDashboard = (p) => (
  <Icon {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 15l4-4 3 3 5-6" />
  </Icon>
);

export const IconFolder = (p) => (
  <Icon {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Icon>
);

export const IconBook = (p) => (
  <Icon {...p}>
    <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
    <path d="M5 17a3 3 0 0 1 3-3h11" />
  </Icon>
);

export const IconReceipt = (p) => (
  <Icon {...p}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
    <path d="M9 8h6M9 12h6" />
  </Icon>
);

export const IconPie = (p) => (
  <Icon {...p}>
    <path d="M12 3v9h9" />
    <path d="M20.5 15A9 9 0 1 1 9 3.5" />
  </Icon>
);

export const IconDownload = (p) => (
  <Icon {...p}>
    <path d="M12 4v11" />
    <path d="M8 11l4 4 4-4" />
    <path d="M5 20h14" />
  </Icon>
);

export const IconPlus = (p) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const IconBolt = (p) => (
  <Icon {...p}>
    <path d="M13 3L5 14h6l-1 7 8-11h-6z" />
  </Icon>
);

export const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M5 12l5 5 9-10" />
  </Icon>
);

export const IconFile = (p) => (
  <Icon {...p}>
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M14 3v5h5" />
  </Icon>
);

export const IconUserPlus = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M19 8v6M16 11h6" />
  </Icon>
);

export const IconAlert = (p) => (
  <Icon {...p}>
    <path d="M12 4l9 16H3z" />
    <path d="M12 10v4M12 17v.5" />
  </Icon>
);

export const IconBars = (p) => (
  <Icon {...p}>
    <path d="M6 20V10M12 20V4M18 20v-7" />
  </Icon>
);

export const IconLogout = (p) => (
  <Icon {...p}>
    <path d="M10 4H5v16h5" />
    <path d="M15 8l4 4-4 4M19 12H9" />
  </Icon>
);

export const IconSearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Icon>
);

export const IconPencil = (p) => (
  <Icon {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16z" />
    <path d="M13.5 6.5l4 4" />
  </Icon>
);

export const IconClose = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const IconSun = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
  </Icon>
);

export const IconCloud = (p) => (
  <Icon {...p}>
    <path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5a4.25 4.25 0 0 1 0 8.5z" />
  </Icon>
);

export const IconRain = (p) => (
  <Icon {...p}>
    <path d="M7 15a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 6.5a4.25 4.25 0 0 1 0 8.5z" />
    <path d="M8 18.5l-1 2M12 18.5l-1 2M16 18.5l-1 2" />
  </Icon>
);

export const IconCamera = (p) => (
  <Icon {...p}>
    <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icon>
);

export const IconTrash = (p) => (
  <Icon {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);
