// Obličeje přes Apple Vision: tvare obr1.jpg obr2.jpg ... -> JSON {cesta: [[x0,y0,x1,y1], ...]} v podílech obrazu, y shora
import Foundation
import Vision
var out: [String: [[Double]]] = [:]
for p in CommandLine.arguments.dropFirst() {
    guard let img = CGImageSourceCreateWithURL(URL(fileURLWithPath: p) as CFURL, nil).flatMap({ CGImageSourceCreateImageAtIndex($0, 0, nil) }) else { continue }
    let req = VNDetectFaceRectanglesRequest()
    try? VNImageRequestHandler(cgImage: img, options: [:]).perform([req])
    out[p] = (req.results ?? []).map { r in
        let b = r.boundingBox
        return [Double(b.minX), Double(1 - b.maxY), Double(b.maxX), Double(1 - b.minY)]
    }
}
print(String(data: try! JSONSerialization.data(withJSONObject: out), encoding: .utf8)!)
