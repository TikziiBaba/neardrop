import os
import struct
import zlib

def create_png(width, height, r, g, b, a=255):
    # Minimal raw RGBA PNG generator
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    
    # Generate image pixels (radial gradient circle)
    raw_data = bytearray()
    cx, cy = width / 2.0, height / 2.0
    radius = min(width, height) * 0.45

    for y in range(height):
        raw_data.append(0) # Filter type 0
        for x in range(width):
            dist = ((x - cx)**2 + (y - cy)**2)**0.5
            if dist <= radius:
                factor = 1.0 - (dist / radius) * 0.3
                raw_data.extend([int(r * factor), int(g * factor), int(b * factor), a])
            else:
                raw_data.extend([0, 0, 0, 0])

    idat = chunk(b'IDAT', zlib.compress(bytes(raw_data)))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

def create_ico(png_data):
    # Wrap a PNG inside an ICO header
    # ICONDIR
    icondir = struct.pack('<HHH', 0, 1, 1)
    # ICONDIRENTRY
    entry = struct.pack('<BBBBHHII', 32, 32, 0, 0, 1, 32, len(png_data), 6 + 16)
    return icondir + entry + png_data

icons_dir = r"c:\Users\dedyu\Desktop\NearDrop\apps\desktop\src-tauri\icons"
os.makedirs(icons_dir, exist_ok=True)

# Vibrant Cyan/Indigo NearDrop brand color (37, 99, 235) / (14, 165, 233)
png_32 = create_png(32, 32, 14, 165, 233)
png_128 = create_png(128, 128, 14, 165, 233)
png_256 = create_png(256, 256, 14, 165, 233)

with open(os.path.join(icons_dir, "32x32.png"), "wb") as f:
    f.write(png_32)

with open(os.path.join(icons_dir, "128x128.png"), "wb") as f:
    f.write(png_128)

with open(os.path.join(icons_dir, "128x128@2x.png"), "wb") as f:
    f.write(png_256)

with open(os.path.join(icons_dir, "icon.png"), "wb") as f:
    f.write(png_256)

with open(os.path.join(icons_dir, "icon.ico"), "wb") as f:
    f.write(create_ico(png_32))

with open(os.path.join(icons_dir, "icon.icns"), "wb") as f:
    f.write(png_256)

print("NearDrop desktop icons generated successfully!")
