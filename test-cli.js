const { PptxGenJS } = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_16x9';

const slide = pptx.addSlide();
slide.addText("Hello World", {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 1,
  fontSize: 36,
});

pptx.writeFile({ fileName: "test-simple.pptx" })
  .then(() => console.log("Success!"))
  .catch(err => console.error("Error:", err));
