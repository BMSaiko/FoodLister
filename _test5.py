import subprocess
from pathlib import Path
r = subprocess.run([r'C:\Users\bruno\AppData\Roaming\npm\npx.CMD', 'jest', '--no-coverage', 'formatters', 'error-messages', 'search', 'activity', 'ListActivityFeed', 'useListActivities'], cwd=r'C:\Users\bruno\Documents\projetcs\foodlister', capture_output=True, text=True, encoding='utf-8', timeout=60)
result = 'EXIT: ' + str(r.returncode) + chr(10)
result += 'STDOUT: ' + r.stdout[-4000:] + chr(10)
result += 'STDERR: ' + r.stderr[-2000:] + chr(10)
Path(r'C:\Users\bruno\Documents\projetcs\foodlister\_test_result5.txt').write_text(result, encoding='utf-8')
print('Done')
