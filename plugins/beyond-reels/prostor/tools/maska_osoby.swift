// Maska lidí v jednom obrázku přes Apple Vision (VNGeneratePersonSegmentationRequest), bez API klíče.
// swift maska_osoby.swift vstup.png vystup.png   (výstup: šedotónová maska ve velikosti vstupu, bílá = člověk)
import AppKit
import CoreImage
import Vision

let a = CommandLine.arguments
guard a.count == 3, let img = NSImage(contentsOfFile: a[1]),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
  FileHandle.standardError.write("použití: swift maska_osoby.swift vstup.png vystup.png\n".data(using: .utf8)!); exit(1)
}
let req = VNGeneratePersonSegmentationRequest()
req.qualityLevel = .accurate
req.outputPixelFormat = kCVPixelFormatType_OneComponent8
try VNImageRequestHandler(cgImage: cg, options: [:]).perform([req])
guard let buf = req.results?.first?.pixelBuffer else { FileHandle.standardError.write("žádný člověk\n".data(using: .utf8)!); exit(2) }
var mask = CIImage(cvPixelBuffer: buf)
mask = mask.transformed(by: CGAffineTransform(scaleX: CGFloat(cg.width) / mask.extent.width, y: CGFloat(cg.height) / mask.extent.height))
let ctx = CIContext()
guard let out = ctx.createCGImage(mask, from: CGRect(x: 0, y: 0, width: cg.width, height: cg.height)) else { exit(3) }
let rep = NSBitmapImageRep(cgImage: out)
try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
