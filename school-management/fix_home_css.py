import re

with open("src/Home.css", "r") as f:
    content = f.read()

# Add CSS variables to the root of .home-page
variables = """
.home-page {
  --nav-bg: rgba(9, 14, 28, 0.9);
  --nav-scrolled: rgba(9, 14, 28, 0.98);
  --nav-links: rgba(13, 18, 35, 0.98);
  --nav-border: rgba(133, 173, 255, 0.15);
  --text-muted: rgba(225, 228, 250, 0.7);
  --text-muted-hover: rgba(225, 228, 250, 0.88);
  --glass-bg: rgba(30, 37, 59, 0.4);
  --glass-bg-hover: rgba(30, 37, 59, 0.72);
  --glass-border: rgba(67, 71, 89, 0.3);
  --hero-overlay-start: rgba(9, 14, 28, 0);
  --hero-overlay-end: rgba(9, 14, 28, 1);
  font-family: var(--font-body);
  background-color: var(--color-surface);
  color: var(--color-on-surface);
  overflow-x: hidden;
}

body[data-theme="light"] .home-page {
  --nav-bg: rgba(255, 255, 255, 0.9);
  --nav-scrolled: rgba(255, 255, 255, 0.98);
  --nav-links: rgba(248, 250, 252, 0.98);
  --nav-border: rgba(203, 213, 225, 0.8);
  --text-muted: rgba(100, 116, 139, 0.9);
  --text-muted-hover: rgba(15, 23, 36, 0.88);
  --glass-bg: rgba(241, 245, 249, 0.65);
  --glass-bg-hover: rgba(226, 232, 240, 0.85);
  --glass-border: rgba(203, 213, 225, 0.8);
  --hero-overlay-start: rgba(255, 255, 255, 0);
  --hero-overlay-end: rgba(255, 255, 255, 1);
}
"""

content = re.sub(r'\.home-page\s*\{\s*font-family[^}]+\}', variables, content)

# Replace values
replacements = {
    r'rgba\(9,\s*14,\s*28,\s*0\.9\)': 'var(--nav-bg)',
    r'rgba\(9,\s*14,\s*28,\s*0\.98\)': 'var(--nav-scrolled)',
    r'rgba\(13,\s*18,\s*35,\s*0\.98\)': 'var(--nav-links)',
    r'rgba\(133,\s*173,\s*255,\s*0\.1[0-9]*\)': 'var(--nav-border)',
    r'rgba\(225,\s*228,\s*250,\s*0\.7\)': 'var(--text-muted)',
    r'rgba\(225,\s*228,\s*250,\s*0\.8[0-9]*\)': 'var(--text-muted-hover)',
    r'rgba\(30,\s*37,\s*59,\s*0\.[456][0-9]*\)': 'var(--glass-bg)',
    r'rgba\(30,\s*37,\s*59,\s*0\.7[0-9]*\)': 'var(--glass-bg-hover)',
    r'rgba\(30,\s*37,\s*59,\s*0\.8\)': 'var(--glass-bg)',
    r'rgba\(67,\s*71,\s*89,\s*0\.[123]\)': 'var(--glass-border)',
    r'rgba\(9,\s*14,\s*28,\s*0\)': 'var(--hero-overlay-start)',
    r'rgba\(9,\s*14,\s*28,\s*1\)': 'var(--hero-overlay-end)',
    r'rgba\(19,\s*25,\s*43,\s*0\.5\)': 'var(--glass-bg)',
}

for pattern, replacement in replacements.items():
    content = re.sub(pattern, replacement, content)

with open("src/Home.css", "w") as f:
    f.write(content)

print("Home.css updated successfully.")
