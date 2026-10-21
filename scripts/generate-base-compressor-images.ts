/**
 * GENERATOR GAMBAR KOMPRESOR PREMIUM (12 gambar dasar)
 * Fotografi produk studio — konsisten, realistis, siap katalog.
 */
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'public', 'images', 'products', 'kompresor');

const BASE_STYLE =
  'professional studio product photography of an HVAC compressor, isolated on pure white seamless background, soft studio lighting with gentle reflections, ultra sharp focus, high resolution, commercial e-commerce catalog photo, teal accent color grading, no text, no watermark, no labels';

const IMAGES: Array<{ file: string; prompt: string }> = [
  {
    file: 'rotary-1pk.png',
    prompt: `${BASE_STYLE}, small black cylindrical rotary compressor for split AC 1 PK, single copper suction tube, black metal shell, mounting rubber feet, three pin electrical connector`,
  },
  {
    file: 'rotary-2pk.png',
    prompt: `${BASE_STYLE}, medium black cylindrical rotary compressor 2 PK for AC split, copper discharge tube bent upward, black powder coated steel shell, rubber mounting grommets`,
  },
  {
    file: 'twin-rotary.png',
    prompt: `${BASE_STYLE}, twin rotary compressor with two stacked cylindrical black chambers, accumulator tank attached on side, multiple copper tubes, inverter AC compressor`,
  },
  {
    file: 'dc-inverter.png',
    prompt: `${BASE_STYLE}, modern DC inverter rotary compressor, matte black cylindrical body with brushed aluminum top plate, white electrical terminal cover, single copper tube, energy efficient design`,
  },
  {
    file: 'scroll-small.png',
    prompt: `${BASE_STYLE}, scroll compressor for light commercial AC, black cylindrical body with flat aluminum top, two copper tubes on side, three phase terminal box, sturdy metal base`,
  },
  {
    file: 'scroll-large.png',
    prompt: `${BASE_STYLE}, large scroll compressor for rooftop commercial HVAC, tall black cylinder with oil sight glass, dual copper suction tubes, heavy bolted base plate`,
  },
  {
    file: 'reciprocating-small.png',
    prompt: `${BASE_STYLE}, hermetic reciprocating piston compressor, compact black cylindrical tank shape with domed top, single copper tube, electrical junction box on top, classic design`,
  },
  {
    file: 'semi-hermetic.png',
    prompt: `${BASE_STYLE}, semi hermetic reciprocating compressor for cold storage, matte gray cast iron body with visible service valves, copper and steel tubing, serviceable bolted flange, industrial motor section`,
  },
  {
    file: 'screw-compressor.png',
    prompt: `${BASE_STYLE}, industrial twin screw compressor unit, large gray and black metal housing with cooling fan grille, pressure gauges, reinforced steel frame base, refrigeration plant equipment`,
  },
  {
    file: 'centrifugal.png',
    prompt: `${BASE_STYLE}, centrifugal chiller compressor assembly, large polished metallic impeller housing, industrial grade steel casing, flanged refrigerant pipes, engineering machinery`,
  },
  {
    file: 'condensing-unit.png',
    prompt: `${BASE_STYLE}, compact outdoor condensing unit with compressor inside, galvanized steel case open showing black compressor and axial fan, copper coil tubing, HVAC installation equipment`,
  },
  {
    file: 'heavy-industrial.png',
    prompt: `${BASE_STYLE}, heavy duty industrial refrigeration compressor, large blue-gray cast steel block with cylinder heads, belt drive pulley, massive bolted base, cold storage plant machinery`,
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const zai = await ZAI.create();

  let ok = 0;
  for (const { file, prompt } of IMAGES) {
    const outPath = path.join(OUT_DIR, file);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 30_000) {
      console.log(`⏭️  Lewati (sudah ada): ${file}`);
      ok++;
      continue;
    }
    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      try {
        const response = await zai.images.generations.create({ prompt, size: '1024x1024' });
        const base64 = response.data?.[0]?.base64;
        if (!base64) throw new Error('Respons kosong');
        fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
        console.log(`✅ ${file} (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB)`);
        ok++;
        break;
      } catch (error) {
        console.error(`⚠️  Percobaan ${attempts} gagal untuk ${file}: ${(error as Error).message}`);
        if (attempts >= 3) console.error(`❌ Gagal total: ${file}`);
        await new Promise((r) => setTimeout(r, 1200 * attempts));
      }
    }
  }
  console.log(`\n🏁 Selesai: ${ok}/${IMAGES.length} gambar dasar tersedia di ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
