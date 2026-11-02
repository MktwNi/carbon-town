/* GHG Town 3D v0.3 — city layout constants (metres; x = east, z = south, y = up) */
window.GHG3L = {
  // roads: a,b = centreline end points; w = carriageway width; side = sidewalk width each side (0 = rural shoulder)
  roads: [
    { id: 'A', a: [-1700, 0], b: [1500, 0], w: 20, side: 4, median: 2, lanes: 4, name: 'ถนนคาร์บอนบูเลอวาร์ด' },
    { id: 'B', a: [-620, -210], b: [560, -210], w: 12, side: 3, lanes: 2, name: 'ถนนอุตสาหกรรม' },
    { id: 'C', a: [-620, 210], b: [560, 210], w: 12, side: 3, lanes: 2, name: 'ถนนสุขภาพดี' },
    { id: 'D', a: [-620, -460], b: [560, -460], w: 12, side: 3, lanes: 2, name: 'ถนนเลียบนิคม' },
    { id: 'E', a: [-620, 460], b: [1500, 460], w: 10, side: 3, lanes: 2, name: 'ถนนสายท้ายเมือง' },
    { id: 'W', a: [-620, -460], b: [-620, 460], w: 12, side: 3, lanes: 2, name: 'ถนนประตูเมือง' },
    { id: 'N2', a: [-440, -460], b: [-440, 460], w: 12, side: 3, lanes: 2, name: 'ถนนตลาดเก่า' },
    { id: 'N3', a: [-170, -460], b: [-170, 460], w: 12, side: 3, lanes: 2, name: 'ถนนวัดกลาง' },
    { id: 'N4', a: [120, -460], b: [120, 460], w: 12, side: 3, lanes: 2, name: 'ถนนศาลากลาง' },
    { id: 'N5', a: [400, -460], b: [400, 460], w: 12, side: 3, lanes: 2, name: 'ถนนริมน้ำ' },
    { id: 'H', a: [-170, -460], b: [-170, -560], w: 8, side: 0, lanes: 2, rural: true, name: 'ทางขึ้นป่าชุมชน' },
    { id: 'F1', a: [760, -600], b: [760, 900], w: 8, side: 0, lanes: 2, rural: true, name: 'ถนนเลียบทุ่ง' },
    { id: 'F2', a: [760, 250], b: [1450, 250], w: 7, side: 0, lanes: 2, rural: true, name: 'ถนนคันนา' }
  ],
  // river: centre x as a function of z, width (water) and flood-wall height
  river: { w: 44, wall: 0.85, x: (z) => 600 + 22 * Math.sin(z / 210) + 10 * Math.sin(z / 77), z0: -2600, z1: 2600 },
  bridges: ['A', 'E'],
  // detailed lots: rect = [x0, z0, x1, z1] (inside sidewalks). front = side facing the access road
  lots: {
    gate: { rect: [-700, -40, -640, 40], note: 'ซุ้มประตูเมืองคร่อมถนน A ที่ x = -660' },
    market: { rect: [-611, -201, -449, -14], front: 'south', road: 'A' },
    minimart: { rect: [-610, -50, -578, -15], front: 'south', road: 'A', note: 'ร้านมินิมาร์ทหัวมุม ถนน A กับถนน W' },
    downtownN: { rect: [-431, -201, -179, -14] },
    downtownS: { rect: [-611, 14, -179, 201] },
    temple: { rect: [-161, -201, 111, -14], front: 'south', road: 'A' },
    municipal: { rect: [-161, 14, -12, 201], front: 'north', road: 'A' },
    plaza: { rect: [-12, 14, 111, 201] },
    school: { rect: [129, -201, 391, -14], front: 'south', road: 'A' },
    hospital: { rect: [129, 14, 391, 201], front: 'north', road: 'A' },
    riverside: { rect: [409, -451, 556, 451] },
    mill: { rect: [-431, -451, -179, -219], front: 'south', road: 'B' },
    factoryW: { rect: [-611, -451, -449, -219] },
    factoryC: { rect: [-161, -451, 111, -219] },
    substation: { rect: [129, -451, 391, -219], front: 'south', road: 'B' },
    housing: { rect: [-611, 219, 391, 451] },
    landfill: { rect: [790, -560, 1060, -300], front: 'west', road: 'F1' },
    corn: { rect: [790, 30, 1000, 220], front: 'west', road: 'F1' },
    paddy: { rect: [790, 280, 1080, 440], front: 'west', road: 'F1' },
    burn: { rect: [1100, 280, 1400, 440], front: 'north', road: 'F2' },
    dairy: { rect: [790, 490, 1000, 680], front: 'west', road: 'F1' },
    forest: { centre: [0, -900], radius: 420, top: [0, -900] }
  },
  // districts for the HUD (first match wins)
  districts: [
    { id: 'gate', name: 'ประตูเมือง', rect: [-1800, -300, -630, 300] },
    { id: 'forest', name: 'ป่าชุมชนบนเนินเขา', rect: [-520, -1500, 520, -500] },
    { id: 'landfill', name: 'ศูนย์กำจัดขยะ', rect: [700, -700, 1200, -250] },
    { id: 'farm', name: 'ทุ่งเกษตรริมน้ำ', rect: [660, -250, 1700, 1200] },
    { id: 'river', name: 'ริมแม่น้ำ', rect: [556, -2600, 660, 2600] },
    { id: 'industry', name: 'นิคมโรงสีและอุตสาหกรรม', rect: [-630, -500, 560, -205] },
    { id: 'market', name: 'ย่านตลาดและการค้า', rect: [-630, -205, -165, 205] },
    { id: 'temple', name: 'วัดกลางเมือง', rect: [-165, -205, 115, -10] },
    { id: 'civic', name: 'ศูนย์ราชการ · สำนักงานเทศบาล', rect: [-165, -10, 115, 205] },
    { id: 'school', name: 'ย่านโรงเรียน', rect: [115, -205, 400, -10] },
    { id: 'hospital', name: 'ย่านโรงพยาบาล', rect: [115, -10, 400, 205] },
    { id: 'riverside', name: 'ย่านคอนโดริมน้ำ', rect: [400, -205, 560, 205] },
    { id: 'housing', name: 'ย่านที่อยู่อาศัย', rect: [-630, 205, 560, 520] }
  ],
  // terrain height (0 inside the city & farmland). Forest hill = cosine bump, far mountains ring.
  H(x, z) {
    let h = 0;
    const dx = x, dz = z + 900;
    const d = Math.sqrt(dx * dx + dz * dz);
    if (d < 420) h += 104 * 0.5 * (1 + Math.cos(Math.PI * d / 420));
    const r = Math.sqrt(x * x + (z - 100) * (z - 100));
    if (r > 2100) {
      const t = Math.min(1, (r - 2100) / 1100);
      h += t * t * (150 + 70 * Math.sin(x / 330) + 55 * Math.cos(z / 260) + 25 * Math.sin((x + z) / 120));
    }
    return h;
  }
};
