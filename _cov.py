import subprocess
r = subprocess.run([r'C:\Users\bruno\AppData\Roaming\npm\npx.CMD', 'jest', '--coverage', '--coverageReporters=text'], cwd=r'C:\Users\bruno\Documents\projetcs\foodlister', capture_output=True, text=True, encoding='utf-8', timeout=120)
result = 'EXIT: ' + str(r.returncode) + chr(10)
result += r.stdout[-5000:]
Path(r'C:\Users\bruno\Documents\projetcs\foodlister\_coverage.txt').write_text(result, encoding='utf-8')
print('Done')
