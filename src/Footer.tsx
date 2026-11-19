function Footer() {
    return (
        <div id = 'footer'>
            <a
                href="https://github.com/edwinfredy/star-ring"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: "inline-block",
                    padding: "10px 18px",
                    background: "transparent",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontFamily: "Arial, sans-serif",
                    fontWeight: 600,
                }}
            >
                <svg
                    height="25"
                    viewBox="0 0 16 16"
                    width="25"
                    fill="white"
                    style={{ verticalAlign: "middle" }}
                >
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.22.48-2.69-1.06-2.69-1.06-.36-.92-.89-1.16-.89-1.16-.73-.5.06-.49.06-.49.8.06 1.22.82 1.22.82.71 1.21 1.87.86 2.33.66.07-.52.28-.86.51-1.06-1.78-.2-3.64-.89-3.64-3.96 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 4.08c.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.08-1.87 3.76-3.65 3.96.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
            </a>

            <a
                href="https://github.com/edwinfredy/star-ring"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: "inline-block",
                    padding: "10px 18px",
                    background: "transparent",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "6px",
                    fontFamily: "Arial, sans-serif",
                    fontWeight: 600,
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            </a>
        </div>
    )
}

export default Footer;