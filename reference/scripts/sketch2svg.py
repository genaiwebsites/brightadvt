"""Minimal Sketch-file renderer for the Open Peeps (mono) library.

Handles artboards, groups, symbol instances (with symbol-swap overrides),
shape groups and shape paths with solid fills/borders, flips and rotation.
That is everything the Open Peeps file uses; it is not a general renderer.

usage: python3 sketch2svg.py <unzipped .sketch dir> <out dir>
"""
import json, math, os, re, sys

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
pages = [json.load(open(os.path.join(src, 'pages', f))) for f in os.listdir(os.path.join(src, 'pages'))]

doc = json.load(open(os.path.join(src, 'document.json')))
shared = {o['do_objectID']: o['value'] for o in doc.get('layerStyles', {}).get('objects', [])}
masters = {}
def index(layer):
    if layer['_class'] == 'symbolMaster':
        masters[layer['symbolID']] = layer
    for k in layer.get('layers', []):
        index(k)
for p in pages:
    for l in p['layers']:
        index(l)

pt = lambda s: tuple(float(v) for v in re.findall(r'-?[\d.e-]+', s))

def color(c):
    return '#%02x%02x%02x' % tuple(round(c[k] * 255) for k in ('red', 'green', 'blue'))

def matrix(layer):
    """Affine for a layer's frame position, rotation and flips (SVG order)."""
    f = layer['frame']; w, h = f['width'], f['height']
    M = [1, 0, 0, 1, f['x'], f['y']]
    def mul(A, B):
        return [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3],
                A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]]
    rot = layer.get('rotation', 0)
    fh, fv = layer.get('isFlippedHorizontal'), layer.get('isFlippedVertical')
    if rot or fh or fv:
        M = mul(M, [1, 0, 0, 1, w/2, h/2])
        if rot:
            r = math.radians(-rot); M = mul(M, [math.cos(r), math.sin(r), -math.sin(r), math.cos(r), 0, 0])
        if fh or fv:
            M = mul(M, [-1 if fh else 1, 0, 0, -1 if fv else 1, 0, 0])
        M = mul(M, [1, 0, 0, 1, -w/2, -h/2])
    return M

def mul_m(A, B):
    return [A[0]*B[0]+A[2]*B[1], A[1]*B[0]+A[3]*B[1], A[0]*B[2]+A[2]*B[3], A[1]*B[2]+A[3]*B[3],
            A[0]*B[4]+A[2]*B[5]+A[4], A[1]*B[4]+A[3]*B[5]+A[5]]

def apply(M, p):
    return (M[0]*p[0] + M[2]*p[1] + M[4], M[1]*p[0] + M[3]*p[1] + M[5])

def path_d(layer, M=None):
    f = layer['frame']; w, h = f['width'], f['height']
    pts = layer.get('points', [])
    if not pts:
        return ''
    P0 = lambda s: (pt(s)[0] * w, pt(s)[1] * h)
    P = (lambda s: apply(M, P0(s))) if M else P0
    d = []
    x, y = P(pts[0]['point']); d.append(f'M{x:.2f} {y:.2f}')
    n = len(pts)
    segs = range(1, n + 1) if layer.get('isClosed') else range(1, n)
    for i in segs:
        a, b = pts[i - 1], pts[i % n]
        c1 = P(a['curveFrom']) if a.get('hasCurveFrom') else P(a['point'])
        c2 = P(b['curveTo']) if b.get('hasCurveTo') else P(b['point'])
        e = P(b['point'])
        if not a.get('hasCurveFrom') and not b.get('hasCurveTo'):
            d.append(f'L{e[0]:.2f} {e[1]:.2f}')
        else:
            d.append(f'C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {e[0]:.2f} {e[1]:.2f}')
    if layer.get('isClosed'):
        d.append('Z')
    return ''.join(d)

def transform(layer, extra=''):
    f = layer['frame']
    t = f'translate({f["x"]:.2f} {f["y"]:.2f})'
    w, h = f['width'], f['height']
    rot = layer.get('rotation', 0)
    fh, fv = layer.get('isFlippedHorizontal'), layer.get('isFlippedVertical')
    if rot or fh or fv:
        t += f' translate({w/2:.2f} {h/2:.2f})'
        if rot:
            t += f' rotate({-rot:.3f})'
        if fh or fv:
            t += f' scale({-1 if fh else 1} {-1 if fv else 1})'
        t += f' translate({-w/2:.2f} {-h/2:.2f})'
    return t + extra

def paint(layer, swaps):
    sid = swaps.get(layer['do_objectID'] + ':style') or layer.get('sharedStyleID')
    st = shared.get(sid) or layer.get('style') or {}
    fills = [f for f in st.get('fills') or [] if f.get('isEnabled')]
    borders = [b for b in st.get('borders') or [] if b.get('isEnabled')]
    a = 'fill="%s"' % color(fills[-1]['color']) if fills else 'fill="none"'
    if borders:
        b = borders[-1]
        a += ' stroke="%s" stroke-width="%.2f" stroke-linecap="round" stroke-linejoin="round"' % (color(b['color']), b['thickness'])
    rule = 'evenodd' if st.get('windingRule') == 1 else 'nonzero'
    return a + f' fill-rule="{rule}"'

def render(layer, swaps):
    if not layer.get('isVisible', True):
        return ''
    c = layer['_class']
    if c in ('slice', 'text'):
        return ''
    if c in ('shapePath', 'rectangle', 'oval', 'triangle', 'star', 'polygon'):
        d = path_d(layer)
        return f'<path transform="{transform(layer)}" d="{d}" {paint(layer, swaps)}/>' if d else ''
    if c == 'shapeGroup':
        # One compound path, so inner contours cut holes (white clothing etc.).
        def collect(l, M):
            out = []
            for k in l.get('layers', []):
                if not k.get('isVisible', True):
                    continue
                KM = mul_m(M, matrix(k))
                if k['_class'] in ('shapePath', 'rectangle', 'oval', 'triangle', 'star', 'polygon'):
                    out.append(path_d(k, KM))
                elif k['_class'] == 'shapeGroup':
                    out.extend(collect(k, KM))
            return out
        d = ''.join(collect(layer, [1, 0, 0, 1, 0, 0]))
        st = layer.get('style') or {}
        rule = 'evenodd' if (layer.get('windingRule', st.get('windingRule')) == 1) else 'nonzero'
        paint_attrs = paint(layer, swaps).replace('fill-rule="nonzero"', '').replace('fill-rule="evenodd"', '')
        return f'<path transform="{transform(layer)}" d="{d}" {paint_attrs} fill-rule="{rule}"/>' if d else ''
    if c == 'symbolInstance':
        sid = swaps.get(layer['do_objectID'], layer['symbolID'])
        m = masters.get(sid)
        if not m:
            return ''
        # Overrides on this instance address nested instances by objectID path.
        nested = dict(swaps)
        for o in layer.get('overrideValues', []):
            name = o['overrideName']
            if name.endswith('_symbolID'):
                key = name[:-len('_symbolID')].split('/')[-1]
                nested[key] = o['value']
            elif name.endswith('_layerStyle'):
                key = name[:-len('_layerStyle')].split('/')[-1]
                nested[key + ':style'] = o['value']
        f, mf = layer['frame'], m['frame']
        sx = f['width'] / mf['width'] if mf['width'] else 1
        sy = f['height'] / mf['height'] if mf['height'] else 1
        inner = ''.join(render(k, nested) for k in m['layers'])
        return f'<g transform="{transform(layer)} scale({sx:.5f} {sy:.5f})">{inner}</g>'
    if c in ('group', 'artboard', 'symbolMaster'):
        inner = ''.join(render(k, swaps) for k in layer.get('layers', []))
        t = transform(layer) if c == 'group' else ''
        return f'<g transform="{t}">{inner}</g>' if t else f'<g>{inner}</g>'
    return ''

def svg(layer, name):
    f = layer['frame']
    body = ''.join(render(k, {}) for k in layer['layers'])
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f["width"]:.0f} {f["height"]:.0f}">{body}</svg>'
    open(os.path.join(out, name + '.svg'), 'w').write(s)

intro = next(p for p in pages if p.get('name') == 'Introduction')
for ab in intro['layers']:
    svg(ab, re.sub(r'\W+', '-', ab['name']).strip('-').lower() + '-' + ab['do_objectID'][:4])

# Each person in the "variations" artboards on its own canvas.
for ab in intro['layers']:
    if not ab['name'].startswith('variations'):
        continue
    for i, inst in enumerate(k for k in ab['layers'] if k['_class'] in ('symbolInstance', 'group')):
        f = inst['frame']
        body = render(dict(inst, frame=dict(f, x=0, y=0)), {})
        open(os.path.join(out, f'{ab["name"]}-{i:02d}.svg'), 'w').write(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f["width"]:.0f} {f["height"]:.0f}">{body}</svg>')
print('masters', len(masters))
