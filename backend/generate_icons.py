"""Generate peacock app icons (192x192 and 512x512 PNG)"""
from PIL import Image, ImageDraw, ImageFont
import math
import os

def create_peacock_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    cx, cy = size // 2, size // 2
    r = size // 2
    
    # Background circle - green gradient
    for i in range(r, 0, -1):
        ratio = i / r
        g = int(34 + (187 - 34) * ratio)  # green gradient
        b = int(197 + (247 - 197) * ratio)
        color = (16, g, b, 255)
        draw.ellipse([cx-i, cy-i, cx+i, cy+i], fill=color)
    
    # Draw tail feathers (fan pattern)
    feather_colors = [
        (6, 182, 212),   # teal
        (34, 197, 94),   # green
        (16, 185, 129),  # emerald
        (20, 184, 166),  # teal
        (34, 197, 94),   # green
        (6, 182, 212),   # teal
        (16, 185, 129),  # emerald
    ]
    
    num_feathers = 7
    fan_start = -120
    fan_end = -60
    fan_center_y = cy + int(size * 0.15)
    
    for i in range(num_feathers):
        angle = math.radians(fan_start + (fan_end - fan_start) * i / (num_feathers - 1))
        length = int(size * 0.38)
        
        # Feather shaft
        ex = cx + int(math.cos(angle) * length)
        ey = fan_center_y + int(math.sin(angle) * length)
        
        feather_width = max(2, size // 60)
        draw.line([(cx, fan_center_y), (ex, ey)], fill=feather_colors[i], width=feather_width)
        
        # Eye spot on feather
        eye_r = max(4, size // 30)
        draw.ellipse([ex-eye_r, ey-eye_r, ex+eye_r, ey+eye_r], fill=(6, 95, 70))
        inner_r = max(2, eye_r // 2)
        draw.ellipse([ex-inner_r, ey-inner_r, ex+inner_r, ey+inner_r], fill=(52, 211, 153))
    
    # Peacock body (teardrop)
    body_r = int(size * 0.15)
    body_cy = cy + int(size * 0.1)
    draw.ellipse([cx - body_r, body_cy - int(body_r * 1.3), cx + body_r, body_cy + int(body_r * 0.8)], 
                 fill=(6, 95, 70))
    
    # Head  
    head_r = int(size * 0.08)
    head_cy = body_cy - int(body_r * 1.3) - int(head_r * 0.3)
    draw.ellipse([cx - head_r, head_cy - head_r, cx + head_r, head_cy + head_r], 
                 fill=(16, 185, 129))
    
    # Eye
    eye_r = max(2, head_r // 3)
    draw.ellipse([cx + eye_r - 1, head_cy - eye_r, cx + eye_r*2 + 1, head_cy + eye_r], fill=(255, 255, 255))
    pupil_r = max(1, eye_r // 2)
    draw.ellipse([cx + eye_r, head_cy - pupil_r, cx + eye_r + pupil_r*2, head_cy + pupil_r], fill=(0, 0, 0))
    
    # Crown
    crown_h = max(3, head_r // 2)
    for j in range(3):
        cx2 = cx - crown_h + j * crown_h
        draw.line([(cx2, head_cy - head_r), (cx2, head_cy - head_r - crown_h)], 
                  fill=(234, 179, 8), width=max(1, size // 128))
        dot_r = max(1, size // 128)
        draw.ellipse([cx2-dot_r, head_cy-head_r-crown_h-dot_r, cx2+dot_r, head_cy-head_r-crown_h+dot_r], 
                     fill=(234, 179, 8))
    
    # Beak
    beak_size = max(2, head_r // 3)
    beak_points = [
        (cx + head_r, head_cy),
        (cx + head_r + beak_size, head_cy + beak_size // 2),
        (cx + head_r, head_cy + beak_size)
    ]
    draw.polygon(beak_points, fill=(234, 179, 8))
    
    return img

# Generate both sizes
output_dir = '../web/public'
for size in [192, 512]:
    icon = create_peacock_icon(size)
    path = os.path.join(output_dir, f'icon-{size}.png')
    icon.save(path, 'PNG')
    print(f'Created: {path} ({size}x{size})')

# Also save as favicon
icon_32 = create_peacock_icon(64)
icon_32 = icon_32.resize((32, 32), Image.LANCZOS)
favicon_path = os.path.join(output_dir, 'favicon.ico')
icon_32.save(favicon_path, 'ICO')
print(f'Created: {favicon_path}')

print('Done!')
