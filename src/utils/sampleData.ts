import { CurveObject, PageConfig, VectorObject } from '../types/corel';
import { generateId } from './bezier';

export const DEFAULT_PAGE_CONFIG: PageConfig = {
  name: 'Letter (Portrait)',
  width: 800,
  height: 600,
  unit: 'px',
  orientation: 'landscape',
  preset: 'Custom 800x600',
};

export const PAGE_PRESETS: { [key: string]: { width: number; height: number; unit: 'px' | 'mm' | 'in' } } = {
  'A4': { width: 794, height: 1123, unit: 'px' },
  'Letter': { width: 816, height: 1056, unit: 'px' },
  'A3': { width: 1123, height: 1587, unit: 'px' },
  'Web 1920x1080': { width: 1920, height: 1080, unit: 'px' },
  'Custom 800x600': { width: 800, height: 600, unit: 'px' },
};

/**
 * High-quality CorelDRAW vector sample illustration
 * Features distinct curve shapes with cusp, smooth, and symmetrical nodes
 */
export function getSampleArtwork(): VectorObject[] {
  // 1. Stylized Corel Balloon / Vector Motif (Iconic Corel hot air balloon / ribbon motif)
  const balloonBody: CurveObject = {
    id: generateId('curve'),
    name: 'Balloon Dome',
    type: 'curve',
    fill: '#2563EB',
    stroke: '#1E3A8A',
    strokeWidth: 2,
    opacity: 1,
    visible: true,
    locked: false,
    transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    subpaths: [
      {
        id: generateId('sub'),
        closed: true,
        nodes: [
          // Top center
          {
            id: generateId('n'),
            x: 400,
            y: 120,
            type: 'symmetrical',
            segmentType: 'curve',
            handleIn: { x: 330, y: 120 },
            handleOut: { x: 470, y: 120 },
          },
          // Right bulge
          {
            id: generateId('n'),
            x: 520,
            y: 220,
            type: 'smooth',
            segmentType: 'curve',
            handleIn: { x: 520, y: 170 },
            handleOut: { x: 520, y: 280 },
          },
          // Bottom taper right
          {
            id: generateId('n'),
            x: 430,
            y: 350,
            type: 'smooth',
            segmentType: 'curve',
            handleIn: { x: 460, y: 310 },
            handleOut: { x: 410, y: 360 },
          },
          // Bottom basket rim
          {
            id: generateId('n'),
            x: 400,
            y: 360,
            type: 'cusp',
            segmentType: 'line',
          },
          // Bottom taper left
          {
            id: generateId('n'),
            x: 370,
            y: 350,
            type: 'smooth',
            segmentType: 'curve',
            handleIn: { x: 390, y: 360 },
            handleOut: { x: 340, y: 310 },
          },
          // Left bulge
          {
            id: generateId('n'),
            x: 280,
            y: 220,
            type: 'smooth',
            segmentType: 'curve',
            handleIn: { x: 280, y: 280 },
            handleOut: { x: 280, y: 170 },
          },
        ],
      },
    ],
  };

  // 2. Yellow decorative stripe
  const centerStripe: CurveObject = {
    id: generateId('curve'),
    name: 'Yellow Ribbon Stripe',
    type: 'curve',
    fill: '#FACC15',
    stroke: '#CA8A04',
    strokeWidth: 1.5,
    opacity: 0.95,
    visible: true,
    locked: false,
    transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    subpaths: [
      {
        id: generateId('sub'),
        closed: true,
        nodes: [
          {
            id: generateId('n'),
            x: 385,
            y: 121,
            type: 'smooth',
            segmentType: 'curve',
            handleIn: { x: 370, y: 121 },
            handleOut: { x: 400, y: 121 },
          },
          {
            id: generateId('n'),
            x: 440,
            y: 220,
            type: 'smooth',
            segmentType: 'curve',
            handleIn: { x: 440, y: 170 },
            handleOut: { x: 430, y: 280 },
          },
          {
            id: generateId('n'),
            x: 410,
            y: 355,
            type: 'cusp',
            segmentType: 'line',
          },
          {
            id: generateId('n'),
            x: 390,
            y: 355,
            type: 'cusp',
            segmentType: 'line',
          },
          {
            id: generateId('n'),
            x: 360,
            y: 220,
            type: 'smooth',
            segmentType: 'curve',
            handleIn: { x: 370, y: 280 },
            handleOut: { x: 360, y: 170 },
          },
        ],
      },
    ],
  };

  // 3. Red wing ribbon curve
  const redWing: CurveObject = {
    id: generateId('curve'),
    name: 'Red Crest Wing',
    type: 'curve',
    fill: '#DC2626',
    stroke: '#991B1B',
    strokeWidth: 2,
    opacity: 0.9,
    visible: true,
    locked: false,
    transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    subpaths: [
      {
        id: generateId('sub'),
        closed: true,
        nodes: [
          {
            id: generateId('n'),
            x: 320,
            y: 230,
            type: 'cusp',
            segmentType: 'curve',
            handleOut: { x: 260, y: 210 },
          },
          {
            id: generateId('n'),
            x: 180,
            y: 260,
            type: 'cusp',
            segmentType: 'curve',
            handleIn: { x: 210, y: 220 },
            handleOut: { x: 210, y: 280 },
          },
          {
            id: generateId('n'),
            x: 310,
            y: 290,
            type: 'smooth',
            segmentType: 'curve',
            handleIn: { x: 260, y: 290 },
            handleOut: { x: 325, y: 270 },
          },
        ],
      },
    ],
  };

  // 4. Emerald leaf / swirl curve
  const emeraldSwirl: CurveObject = {
    id: generateId('curve'),
    name: 'Emerald Swirl',
    type: 'curve',
    fill: '#10B981',
    stroke: '#065F46',
    strokeWidth: 2,
    opacity: 0.9,
    visible: true,
    locked: false,
    transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
    subpaths: [
      {
        id: generateId('sub'),
        closed: true,
        nodes: [
          {
            id: generateId('n'),
            x: 480,
            y: 230,
            type: 'cusp',
            segmentType: 'curve',
            handleOut: { x: 540, y: 210 },
          },
          {
            id: generateId('n'),
            x: 620,
            y: 260,
            type: 'cusp',
            segmentType: 'curve',
            handleIn: { x: 590, y: 220 },
            handleOut: { x: 590, y: 280 },
          },
          {
            id: generateId('n'),
            x: 490,
            y: 290,
            type: 'smooth',
            segmentType: 'curve',
            handleIn: { x: 540, y: 290 },
            handleOut: { x: 475, y: 270 },
          },
        ],
      },
    ],
  };

  // 5. Classic decorative star base badge
  const starBadge: VectorObject = {
    id: generateId('star'),
    name: '5-Point Star Badge',
    type: 'polygon',
    cx: 400,
    cy: 450,
    radius: 45,
    sides: 5,
    isStar: true,
    sharpness: 0.55,
    fill: '#F59E0B',
    stroke: '#B45309',
    strokeWidth: 2,
    opacity: 1,
    visible: true,
    locked: false,
    transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
  };

  return [balloonBody, centerStripe, redWing, emeraldSwirl, starBadge];
}

/**
 * CorelDRAW Default CMYK / RGB 40-color palette
 */
export const COREL_PALETTE: { name: string; hex: string }[] = [
  { name: 'None (No Fill/Stroke)', hex: 'none' },
  { name: 'Black', hex: '#000000' },
  { name: '90% Black', hex: '#1C1C1C' },
  { name: '80% Black', hex: '#333333' },
  { name: '70% Black', hex: '#4D4D4D' },
  { name: '60% Black', hex: '#666666' },
  { name: '50% Black', hex: '#808080' },
  { name: '40% Black', hex: '#999999' },
  { name: '30% Black', hex: '#B3B3B3' },
  { name: '20% Black', hex: '#CCCCCC' },
  { name: '10% Black', hex: '#E6E6E6' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Ruby Red', hex: '#990000' },
  { name: 'Red', hex: '#ED1C24' },
  { name: 'Light Red', hex: '#F26522' },
  { name: 'Deep Orange', hex: '#F7941D' },
  { name: 'Orange', hex: '#FF7F00' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Yellow', hex: '#FFF200' },
  { name: 'Lime Green', hex: '#8DC63F' },
  { name: 'Spring Green', hex: '#39B54A' },
  { name: 'Forest Green', hex: '#009245' },
  { name: 'Dark Green', hex: '#006837' },
  { name: 'Teal', hex: '#00A99D' },
  { name: 'Cyan', hex: '#00AEEF' },
  { name: 'Sky Blue', hex: '#3399FF' },
  { name: 'Ocean Blue', hex: '#0072BC' },
  { name: 'Navy Blue', hex: '#0054A6' },
  { name: 'Deep Navy', hex: '#2E3192' },
  { name: 'Indigo', hex: '#1B1464' },
  { name: 'Purple', hex: '#662D91' },
  { name: 'Magenta', hex: '#EC008C' },
  { name: 'Rose Pink', hex: '#ED145B' },
  { name: 'Hot Pink', hex: '#FF69B4' },
  { name: 'Coral', hex: '#FF7F7F' },
  { name: 'Sienna Brown', hex: '#754C24' },
  { name: 'Raw Umber', hex: '#603813' },
  { name: 'Warm Gray', hex: '#A69B97' },
  { name: 'Cool Slate', hex: '#64748B' },
  { name: 'Cyber Violet', hex: '#8B5CF6' },
];
