import {
  CurveNode,
  CurveObject,
  EllipseObject,
  Point,
  PolygonObject,
  RectangleObject,
  Subpath,
  VectorObject,
} from '../types/vectordraw';

export function generateId(prefix = 'obj'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Builds an SVG 'd' path string from subpaths
 */
export function subpathsToSvgPath(subpaths: Subpath[]): string {
  if (!subpaths || subpaths.length === 0) return '';

  let d = '';
  for (const sub of subpaths) {
    const nodes = sub.nodes;
    if (nodes.length === 0) continue;

    d += `M ${nodes[0].x} ${nodes[0].y} `;

    for (let i = 0; i < nodes.length - 1; i++) {
      const curr = nodes[i];
      const next = nodes[i + 1];

      if (curr.segmentType === 'line' || (!curr.handleOut && !next.handleIn)) {
        d += `L ${next.x} ${next.y} `;
      } else {
        const cp1 = curr.handleOut || { x: curr.x, y: curr.y };
        const cp2 = next.handleIn || { x: next.x, y: next.y };
        d += `C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${next.x} ${next.y} `;
      }
    }

    if (sub.closed && nodes.length > 1) {
      const last = nodes[nodes.length - 1];
      const first = nodes[0];
      if (last.segmentType === 'line' || (!last.handleOut && !first.handleIn)) {
        d += `Z `;
      } else {
        const cp1 = last.handleOut || { x: last.x, y: last.y };
        const cp2 = first.handleIn || { x: first.x, y: first.y };
        d += `C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${first.x} ${first.y} Z `;
      }
    }
  }

  return d.trim();
}

/**
 * Converts a rectangle object to a CurveObject (Ctrl+Q)
 */
export function rectangleToCurve(rect: RectangleObject): CurveObject {
  const { x, y, width, height, cornerRadii } = rect;
  const [tl, tr, br, bl] = cornerRadii;

  const nodes: CurveNode[] = [];

  if (tl === 0 && tr === 0 && br === 0 && bl === 0) {
    nodes.push(
      { id: generateId('n'), x, y, type: 'cusp', segmentType: 'line' },
      { id: generateId('n'), x: x + width, y, type: 'cusp', segmentType: 'line' },
      { id: generateId('n'), x: x + width, y: y + height, type: 'cusp', segmentType: 'line' },
      { id: generateId('n'), x, y: y + height, type: 'cusp', segmentType: 'line' }
    );
  } else {
    // Rounded rectangle using cubic bézier segments
    // VectorDraw style kappa constant for rounded corners
    const k = 0.5522847498;

    // Top edge & TR corner
    nodes.push({
      id: generateId('n'),
      x: x + tl,
      y,
      type: 'smooth',
      segmentType: 'line',
    });
    nodes.push({
      id: generateId('n'),
      x: x + width - tr,
      y,
      type: 'smooth',
      segmentType: 'curve',
      handleOut: { x: x + width - tr + tr * k, y },
    });
    // Right edge & BR corner
    nodes.push({
      id: generateId('n'),
      x: x + width,
      y: y + tr,
      type: 'smooth',
      segmentType: 'line',
      handleIn: { x: x + width, y: y + tr - tr * k },
    });
    nodes.push({
      id: generateId('n'),
      x: x + width,
      y: y + height - br,
      type: 'smooth',
      segmentType: 'curve',
      handleOut: { x: x + width, y: y + height - br + br * k },
    });
    // Bottom edge & BL corner
    nodes.push({
      id: generateId('n'),
      x: x + width - br,
      y: y + height,
      type: 'smooth',
      segmentType: 'line',
      handleIn: { x: x + width - br + br * k, y: y + height },
    });
    nodes.push({
      id: generateId('n'),
      x: x + bl,
      y: y + height,
      type: 'smooth',
      segmentType: 'curve',
      handleOut: { x: x + bl - bl * k, y: y + height },
    });
    // Left edge & TL corner
    nodes.push({
      id: generateId('n'),
      x,
      y: y + height - bl,
      type: 'smooth',
      segmentType: 'line',
      handleIn: { x, y: y + height - bl + bl * k },
    });
    nodes.push({
      id: generateId('n'),
      x,
      y: y + tl,
      type: 'smooth',
      segmentType: 'curve',
      handleOut: { x, y: y + tl - tl * k },
      handleIn: { x: x + tl - tl * k, y },
    });
  }

  return {
    ...rect,
    type: 'curve',
    subpaths: [{ id: generateId('sub'), nodes, closed: true }],
  };
}

/**
 * Converts an ellipse object to a CurveObject with 4 smooth/symmetrical nodes (Ctrl+Q)
 */
export function ellipseToCurve(ellipse: EllipseObject): CurveObject {
  const { cx, cy, rx, ry, kind, startAngle, endAngle } = ellipse;

  if (kind === 'ellipse' || Math.abs(endAngle - startAngle) >= 360) {
    const k = 0.5522847498; // cubic approximation constant
    const hx = rx * k;
    const hy = ry * k;

    const nodes: CurveNode[] = [
      // Top node (12 o'clock)
      {
        id: generateId('n'),
        x: cx,
        y: cy - ry,
        type: 'symmetrical',
        segmentType: 'curve',
        handleIn: { x: cx - hx, y: cy - ry },
        handleOut: { x: cx + hx, y: cy - ry },
      },
      // Right node (3 o'clock)
      {
        id: generateId('n'),
        x: cx + rx,
        y: cy,
        type: 'symmetrical',
        segmentType: 'curve',
        handleIn: { x: cx + rx, y: cy - hy },
        handleOut: { x: cx + rx, y: cy + hy },
      },
      // Bottom node (6 o'clock)
      {
        id: generateId('n'),
        x: cx,
        y: cy + ry,
        type: 'symmetrical',
        segmentType: 'curve',
        handleIn: { x: cx + hx, y: cy + ry },
        handleOut: { x: cx - hx, y: cy + ry },
      },
      // Left node (9 o'clock)
      {
        id: generateId('n'),
        x: cx - rx,
        y: cy,
        type: 'symmetrical',
        segmentType: 'curve',
        handleIn: { x: cx - rx, y: cy + hy },
        handleOut: { x: cx - rx, y: cy - hy },
      },
    ];

    return {
      ...ellipse,
      type: 'curve',
      subpaths: [{ id: generateId('sub'), nodes, closed: true }],
    };
  }

  // Pie or Arc conversion
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const steps = 8;
  const delta = (endRad - startRad) / steps;
  const nodes: CurveNode[] = [];

  if (kind === 'pie') {
    nodes.push({
      id: generateId('n'),
      x: cx,
      y: cy,
      type: 'cusp',
      segmentType: 'line',
    });
  }

  for (let i = 0; i <= steps; i++) {
    const angle = startRad + i * delta;
    const px = cx + rx * Math.cos(angle);
    const py = cy + ry * Math.sin(angle);
    nodes.push({
      id: generateId('n'),
      x: px,
      y: py,
      type: 'smooth',
      segmentType: 'line',
    });
  }

  return {
    ...ellipse,
    type: 'curve',
    subpaths: [{ id: generateId('sub'), nodes, closed: kind === 'pie' }],
  };
}

/**
 * Converts a polygon or star object to a CurveObject
 */
export function polygonToCurve(poly: PolygonObject): CurveObject {
  const { cx, cy, radius, sides, isStar, sharpness } = poly;
  const totalPoints = isStar ? sides * 2 : sides;
  const angleStep = (Math.PI * 2) / totalPoints;
  const nodes: CurveNode[] = [];

  for (let i = 0; i < totalPoints; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const r = isStar && i % 2 === 1 ? radius * (1 - sharpness) : radius;
    nodes.push({
      id: generateId('n'),
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      type: 'cusp',
      segmentType: 'line',
    });
  }

  return {
    ...poly,
    type: 'curve',
    subpaths: [{ id: generateId('sub'), nodes, closed: true }],
  };
}

/**
 * Master Convert to Curves (Ctrl+Q)
 */
export function convertObjectToCurves(obj: VectorObject): CurveObject {
  if (obj.type === 'curve') return obj;
  if (obj.type === 'rectangle') return rectangleToCurve(obj);
  if (obj.type === 'ellipse') return ellipseToCurve(obj);
  if (obj.type === 'polygon') return polygonToCurve(obj);

  // If text, convert to a decorative bounding curve or placeholder curve
  const nodes: CurveNode[] = [
    { id: generateId('n'), x: obj.x, y: obj.y - 30, type: 'cusp', segmentType: 'line' },
    { id: generateId('n'), x: obj.x + 120, y: obj.y - 30, type: 'cusp', segmentType: 'line' },
    { id: generateId('n'), x: obj.x + 120, y: obj.y + 10, type: 'cusp', segmentType: 'line' },
    { id: generateId('n'), x: obj.x, y: obj.y + 10, type: 'cusp', segmentType: 'line' },
  ];
  return {
    ...obj,
    type: 'curve',
    subpaths: [{ id: generateId('sub'), nodes, closed: true }],
  };
}

/**
 * Updates handles when an anchor or handle is moved to maintain Cusp / Smooth / Symmetrical rules
 */
export function updateNodeHandles(
  node: CurveNode,
  moved: 'handleIn' | 'handleOut' | 'anchor',
  newPos: Point
): CurveNode {
  const updated = { ...node };

  if (moved === 'anchor') {
    const dx = newPos.x - node.x;
    const dy = newPos.y - node.y;
    updated.x = newPos.x;
    updated.y = newPos.y;
    if (updated.handleIn) {
      updated.handleIn = { x: updated.handleIn.x + dx, y: updated.handleIn.y + dy };
    }
    if (updated.handleOut) {
      updated.handleOut = { x: updated.handleOut.x + dx, y: updated.handleOut.y + dy };
    }
    return updated;
  }

  if (moved === 'handleIn') {
    updated.handleIn = { ...newPos };

    if (node.type === 'cusp' || !updated.handleOut) {
      return updated;
    }

    const angleIn = Math.atan2(newPos.y - node.y, newPos.x - node.x);
    const oppositeAngle = angleIn + Math.PI;

    if (node.type === 'smooth') {
      const outDist = distance(node, updated.handleOut);
      updated.handleOut = {
        x: node.x + Math.cos(oppositeAngle) * outDist,
        y: node.y + Math.sin(oppositeAngle) * outDist,
      };
    } else if (node.type === 'symmetrical') {
      const inDist = distance(node, newPos);
      updated.handleOut = {
        x: node.x + Math.cos(oppositeAngle) * inDist,
        y: node.y + Math.sin(oppositeAngle) * inDist,
      };
    }
  } else if (moved === 'handleOut') {
    updated.handleOut = { ...newPos };

    if (node.type === 'cusp' || !updated.handleIn) {
      return updated;
    }

    const angleOut = Math.atan2(newPos.y - node.y, newPos.x - node.x);
    const oppositeAngle = angleOut + Math.PI;

    if (node.type === 'smooth') {
      const inDist = distance(node, updated.handleIn);
      updated.handleIn = {
        x: node.x + Math.cos(oppositeAngle) * inDist,
        y: node.y + Math.sin(oppositeAngle) * inDist,
      };
    } else if (node.type === 'symmetrical') {
      const outDist = distance(node, newPos);
      updated.handleIn = {
        x: node.x + Math.cos(oppositeAngle) * outDist,
        y: node.y + Math.sin(oppositeAngle) * outDist,
      };
    }
  }

  return updated;
}

/**
 * Subdivides a cubic Bézier segment at parameter t (0.5) to insert a new node smoothly
 */
export function splitBezierSegment(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t = 0.5
): {
  sub1: [Point, Point, Point, Point];
  sub2: [Point, Point, Point, Point];
  midPoint: Point;
} {
  const lerp = (a: Point, b: Point, factor: number): Point => ({
    x: a.x + (b.x - a.x) * factor,
    y: a.y + (b.y - a.y) * factor,
  });

  const p01 = lerp(p0, p1, t);
  const p12 = lerp(p1, p2, t);
  const p23 = lerp(p2, p3, t);

  const p012 = lerp(p01, p12, t);
  const p123 = lerp(p12, p23, t);

  const mid = lerp(p012, p123, t);

  return {
    sub1: [p0, p01, p012, mid],
    sub2: [mid, p123, p23, p3],
    midPoint: mid,
  };
}

/**
 * Inserts a new node into a subpath at the segment after nodeIndex
 */
export function insertNodeOnSegment(
  subpath: Subpath,
  nodeIndex: number
): Subpath {
  const nodes = [...subpath.nodes];
  const curr = nodes[nodeIndex];
  const nextIndex = (nodeIndex + 1) % nodes.length;
  const next = nodes[nextIndex];

  if (!subpath.closed && nodeIndex === nodes.length - 1) {
    return subpath; // Can't insert after open end
  }

  if (curr.segmentType === 'line' || (!curr.handleOut && !next.handleIn)) {
    // Straight line midpoint
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    const newNode: CurveNode = {
      id: generateId('n'),
      x: midX,
      y: midY,
      type: 'cusp',
      segmentType: 'line',
    };
    nodes.splice(nodeIndex + 1, 0, newNode);
  } else {
    const p0 = { x: curr.x, y: curr.y };
    const p1 = curr.handleOut || p0;
    const p2 = next.handleIn || { x: next.x, y: next.y };
    const p3 = { x: next.x, y: next.y };

    const { sub1, sub2, midPoint } = splitBezierSegment(p0, p1, p2, p3, 0.5);

    // Update curr
    curr.handleOut = sub1[1];

    // New intermediate node
    const newNode: CurveNode = {
      id: generateId('n'),
      x: midPoint.x,
      y: midPoint.y,
      type: 'smooth',
      segmentType: 'curve',
      handleIn: sub1[2],
      handleOut: sub2[1],
    };

    // Update next
    next.handleIn = sub2[2];

    nodes.splice(nodeIndex + 1, 0, newNode);
  }

  return { ...subpath, nodes };
}

/**
 * Freehand path smoothing: Simplifies and fits cubic Bézier curves
 */
export function smoothFreehandPoints(rawPoints: Point[], tolerance = 3): Subpath {
  if (rawPoints.length < 2) {
    return {
      id: generateId('sub'),
      closed: false,
      nodes: rawPoints.map(p => ({
        id: generateId('n'),
        x: p.x,
        y: p.y,
        type: 'cusp',
        segmentType: 'line',
      })),
    };
  }

  // 1. Ramer-Douglas-Peucker simplification
  const simplified = rdpSimplify(rawPoints, tolerance);
  if (simplified.length < 3) {
    return {
      id: generateId('sub'),
      closed: false,
      nodes: simplified.map(p => ({
        id: generateId('n'),
        x: p.x,
        y: p.y,
        type: 'cusp',
        segmentType: 'line',
      })),
    };
  }

  // 2. Generate smooth Bézier handles using Catmull-Rom style tangents
  const nodes: CurveNode[] = [];
  const n = simplified.length;

  for (let i = 0; i < n; i++) {
    const curr = simplified[i];
    const prev = i > 0 ? simplified[i - 1] : null;
    const next = i < n - 1 ? simplified[i + 1] : null;

    let handleIn: Point | undefined;
    let handleOut: Point | undefined;

    if (prev && next) {
      // Tangent vector
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const dPrev = distance(curr, prev);
      const dNext = distance(curr, next);
      const totalD = dPrev + dNext;

      const tension = 0.28;
      if (totalD > 0) {
        handleIn = {
          x: curr.x - (dx * (dPrev / totalD)) * tension,
          y: curr.y - (dy * (dPrev / totalD)) * tension,
        };
        handleOut = {
          x: curr.x + (dx * (dNext / totalD)) * tension,
          y: curr.y + (dy * (dNext / totalD)) * tension,
        };
      }
    } else if (!prev && next) {
      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      handleOut = {
        x: curr.x + dx * 0.28,
        y: curr.y + dy * 0.28,
      };
    } else if (prev && !next) {
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      handleIn = {
        x: curr.x - dx * 0.28,
        y: curr.y - dy * 0.28,
      };
    }

    nodes.push({
      id: generateId('n'),
      x: curr.x,
      y: curr.y,
      type: 'smooth',
      segmentType: i === n - 1 ? 'line' : 'curve',
      handleIn,
      handleOut,
    });
  }

  return {
    id: generateId('sub'),
    closed: false,
    nodes,
  };
}

function rdpSimplify(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let index = 0;
  const start = points[0];
  const end = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], start, end);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }

  if (maxDist > epsilon) {
    const left = rdpSimplify(points.slice(0, index + 1), epsilon);
    const right = rdpSimplify(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  } else {
    return [start, end];
  }
}

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lineLenSq = dx * dx + dy * dy;

  if (lineLenSq === 0) return distance(point, lineStart);

  const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lineLenSq;
  const clampedT = Math.max(0, Math.min(1, t));
  const projection = {
    x: lineStart.x + clampedT * dx,
    y: lineStart.y + clampedT * dy,
  };

  return distance(point, projection);
}

/**
 * Calculates bounding box of an object
 */
export function getObjectBoundingBox(obj: VectorObject): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (obj.type === 'rectangle') {
    return { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
  }
  if (obj.type === 'ellipse') {
    return {
      x: obj.cx - obj.rx,
      y: obj.cy - obj.ry,
      width: obj.rx * 2,
      height: obj.ry * 2,
    };
  }
  if (obj.type === 'polygon') {
    return {
      x: obj.cx - obj.radius,
      y: obj.cy - obj.radius,
      width: obj.radius * 2,
      height: obj.radius * 2,
    };
  }
  if (obj.type === 'text') {
    const estimatedWidth = Math.max(obj.text.length * obj.fontSize * 0.6, 24);
    const height = obj.fontSize * 1.3;
    let startX = obj.x;
    if (obj.textAlign === 'center') {
      startX = obj.x - estimatedWidth / 2;
    } else if (obj.textAlign === 'right') {
      startX = obj.x - estimatedWidth;
    }
    return {
      x: startX,
      y: obj.y - obj.fontSize * 0.9,
      width: estimatedWidth,
      height,
    };
  }

  // CurveObject: calculate from all nodes and control points
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const sub of obj.subpaths) {
    for (const node of sub.nodes) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);

      if (node.handleIn) {
        minX = Math.min(minX, node.handleIn.x);
        minY = Math.min(minY, node.handleIn.y);
        maxX = Math.max(maxX, node.handleIn.x);
        maxY = Math.max(maxY, node.handleIn.y);
      }
      if (node.handleOut) {
        minX = Math.min(minX, node.handleOut.x);
        minY = Math.min(minY, node.handleOut.y);
        maxX = Math.max(maxX, node.handleOut.x);
        maxY = Math.max(maxY, node.handleOut.y);
      }
    }
  }

  if (minX === Infinity) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
  };
}
