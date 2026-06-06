import subprocess
from pathlib import Path
r = subprocess.run([r'C:\Users\bruno\AppData\Roaming\npm\npx.CMD', 'next', 'build'], cwd=r'C:\Users\bruno\Documents\projetcs\foodlister', capture_output=True, text=True, timeout=300)
result = 'EXIT: ' + str(r.returncode) + chr(10)
result += r.stdout[-2000:]
Path(r'C:\Users\bruno\Documents\projetcs\foodlister\_build3.txt').write_text(result, encoding='utf-8')
print('Done')
