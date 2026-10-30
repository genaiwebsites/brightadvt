"""Builds the hero crowd as separate body and head layers.

Each figure recombines the library's parts (pose x head x face x facial hair
x accessories). The body and the head are rendered on the same canvas so they
re-align exactly, which lets the head turn, tilt and nod on its own.

usage: python3 peeps-crowd2.py <unzipped .sketch dir> <out dir> [count] [seed]
"""
import importlib.util, json, os, random, sys

src, out = sys.argv[1], sys.argv[2]
count = int(sys.argv[3]) if len(sys.argv) > 3 else 56
rng = random.Random(int(sys.argv[4]) if len(sys.argv) > 4 else 3)

spec = importlib.util.spec_from_file_location('s2s', os.path.join(os.path.dirname(__file__), 'sketch2svg.py'))
sys.argv = [sys.argv[0], src, os.path.join(out, '_ignore')]
s2s = importlib.util.module_from_spec(spec)
spec.loader.exec_module(s2s)

by_name = {m['name']: m for m in s2s.masters.values()}
cat = lambda p: [(n, m['symbolID']) for n, m in by_name.items() if n.startswith(p) and not n.endswith('* None')]
none = lambda p: next(m['symbolID'] for n, m in by_name.items() if n.startswith(p) and n.endswith('* None'))
heads, faces, hair, acc = cat('head/'), cat('face/'), cat('facial-hair/'), cat('accessories/')
poses = cat('pose/standing/')

master = by_name['a person/standing']
slots, head_group = {}, None
for l in master['layers']:
    if l['_class'] == 'symbolInstance':
        slots[l['name'].upper()] = l['do_objectID']
    if l['_class'] == 'group' and l['name'].lower() == 'head':
        head_group = l
        for k in l['layers']:
            slots[k['name'].upper()] = k['do_objectID']

VB = (-200, 0, 1800, 3300)
hf = head_group['frame']
PIVOT = (hf['x'] + hf['width'] / 2, hf['y'] + hf['height'] * 0.97)  # base of the neck

os.makedirs(out, exist_ok=True)
meta = []
for i in range(count):
    pname, pose = rng.choice(poses)
    swaps = {
        slots['BODY']: pose,
        slots['HEAD']: rng.choice(heads)[1],
        slots['FACE']: rng.choice(faces)[1],
        slots['FACIAL HAIR']: rng.choice(hair)[1] if rng.random() < 0.25 else none('facial-hair/'),
        slots['ACCESORIES']: rng.choice(acc)[1] if rng.random() < 0.25 else none('accessories/'),
    }
    body = ''.join(s2s.render(k, swaps) for k in master['layers'] if k is not head_group)
    head = s2s.render(head_group, swaps)
    vb = ' '.join(map(str, VB))
    open(os.path.join(out, f'b{i:03d}.svg'), 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{body}</svg>')
    open(os.path.join(out, f'h{i:03d}.svg'), 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{head}</svg>')
    meta.append({'i': i, 'pose': pname.split('/')[-1]})
json.dump({'viewBox': VB, 'pivot': PIVOT, 'figures': meta}, open(os.path.join(out, 'meta.json'), 'w'))
print(count, 'figures; pivot', PIVOT)
