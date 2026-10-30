"""Builds a crowd of unique Open Peeps by recombining the library's parts
(pose x head x face x facial hair x accessories), plus a few cyclists and
wheelchair users, and writes one SVG per figure.

usage: python3 peeps-crowd.py <unzipped .sketch dir> <out dir> [count] [seed]
"""
import importlib.util, json, os, random, sys

src, out = sys.argv[1], sys.argv[2]
count = int(sys.argv[3]) if len(sys.argv) > 3 else 72
rng = random.Random(int(sys.argv[4]) if len(sys.argv) > 4 else 7)

# Reuse the renderer (it indexes masters and styles on import).
spec = importlib.util.spec_from_file_location('s2s', os.path.join(os.path.dirname(__file__), 'sketch2svg.py'))
sys.argv = [sys.argv[0], src, os.path.join(out, '_ignore')]
s2s = importlib.util.module_from_spec(spec)
spec.loader.exec_module(s2s)

by_name = {m['name']: m for m in s2s.masters.values()}
cat = lambda prefix: [m['symbolID'] for n, m in by_name.items() if n.startswith(prefix) and not n.endswith('* None')]
none = lambda prefix: next((m['symbolID'] for n, m in by_name.items() if n.startswith(prefix) and n.endswith('* None')), None)

heads, faces = cat('head/'), cat('face/')
hair, acc = cat('facial-hair/'), cat('accessories/')
poses = cat('pose/standing/')
bike = by_name['pose/sitting/bike']['symbolID']
wheel = by_name['pose/sitting/wheelchair']['symbolID']

def slots(master):
    """objectIDs of BODY / HEAD / FACE / FACIAL HAIR / ACCESORIES instances inside a person master."""
    found = {}
    def walk(l):
        for k in l.get('layers', []):
            if k['_class'] == 'symbolInstance':
                found[k['name'].upper()] = k['do_objectID']
            walk(k)
    walk(master)
    return found

def person(master_name, pose):
    m = by_name[master_name]
    s = slots(m)
    swaps = {
        s['BODY']: pose,
        s['HEAD']: rng.choice(heads),
        s['FACE']: rng.choice(faces),
    }
    if 'FACIAL HAIR' in s:
        swaps[s['FACIAL HAIR']] = rng.choice(hair) if rng.random() < 0.28 else none('facial-hair/')
    if 'ACCESORIES' in s:
        swaps[s['ACCESORIES']] = rng.choice(acc) if rng.random() < 0.3 else none('accessories/')
    body = ''.join(s2s.render(k, swaps) for k in m['layers'])
    # Generous canvas; figures are trimmed after rasterising.
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1400 -100 4400 3700">{body}</svg>'

os.makedirs(out, exist_ok=True)
meta = []
for i in range(count):
    open(os.path.join(out, f'walk-{i:03d}.svg'), 'w').write(person('a person/standing', rng.choice(poses)))
    meta.append({'file': f'walk-{i:03d}', 'kind': 'walk'})
for i in range(4):
    open(os.path.join(out, f'bike-{i:03d}.svg'), 'w').write(person('a person/sitting', bike))
    meta.append({'file': f'bike-{i:03d}', 'kind': 'bike'})
for i in range(3):
    open(os.path.join(out, f'wheel-{i:03d}.svg'), 'w').write(person('a person/sitting', wheel))
    meta.append({'file': f'wheel-{i:03d}', 'kind': 'wheel'})
json.dump(meta, open(os.path.join(out, 'meta.json'), 'w'))
print(len(meta), 'figures;', len(poses), 'poses', len(heads), 'heads', len(faces), 'faces')
