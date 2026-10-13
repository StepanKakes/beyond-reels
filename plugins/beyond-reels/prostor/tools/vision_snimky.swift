// Text (OCR) a obličeje ve snímcích přes Apple Vision, lokálně a bez API klíče. Mac změří, Claude čte jen text.
//   swift vision_snimky.swift snimek1.png snimek2.jpg ...   > vysledek.json
// Výstup: JSON pole {soubor, w, h, texty:[{t, jistota, box:[x,y,w,h]}], obliceje:[[x,y,w,h]]}, box v pixelech, počátek vlevo nahoře.
// Rychlejší je zkompilovaná verze: swiftc -O vision_snimky.swift -o ~/.cache/beyond-reels/bin/vision_snimky
import AppKit
import Foundation
import Vision

func box(_ r: CGRect, _ w: Int, _ h: Int) -> [Int] {
  [Int(r.minX * CGFloat(w)), Int((1 - r.maxY) * CGFloat(h)), Int(r.width * CGFloat(w)), Int(r.height * CGFloat(h))]
}

var vystup: [[String: Any]] = []
for cesta in CommandLine.arguments.dropFirst() {
  guard let img = NSImage(contentsOfFile: cesta), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    vystup.append(["soubor": cesta, "chyba": "nejde načíst"]); continue
  }
  let w = cg.width, h = cg.height
  let text = VNRecognizeTextRequest()
  text.recognitionLevel = .accurate
  text.usesLanguageCorrection = false            // chceme vidět překlepy tak, jak jsou v obraze
  text.recognitionLanguages = ["cs-CZ", "en-US"]
  let tvare = VNDetectFaceRectanglesRequest()
  try? VNImageRequestHandler(cgImage: cg, options: [:]).perform([text, tvare])
  let texty: [[String: Any]] = (text.results ?? []).compactMap { o in
    guard let k = o.topCandidates(1).first else { return nil }
    return ["t": k.string, "jistota": (Double(k.confidence) * 100).rounded() / 100, "box": box(o.boundingBox, w, h)]
  }
  let obliceje = (tvare.results ?? []).map { box($0.boundingBox, w, h) }
  vystup.append(["soubor": cesta, "w": w, "h": h, "texty": texty, "obliceje": obliceje])
}
let data = try JSONSerialization.data(withJSONObject: vystup, options: [])
FileHandle.standardOutput.write(data)
