import sys
import tempfile
import unittest
from pathlib import Path
from xml.dom import minidom
from zipfile import ZipFile

sys.dont_write_bytecode = True
from extract_template import W, extract_docx, extract_pdf, list_blocks, parse_pages


class TemplateExtractionTests(unittest.TestCase):
    def test_docx_retains_original_format_resources_and_effective_section(self):
        with tempfile.TemporaryDirectory() as directory:
            source, target = Path(directory) / "source.docx", Path(directory) / "template.docx"
            document = f'''<w:document xmlns:w="{W}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:w14="urn:test" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="w14"><w:body>
<w:p><w:pPr><w:sectPr><w:headerReference w:type="default" r:id="rId7"/></w:sectPr></w:pPr><w:r><w:t>Excluded introduction</w:t></w:r></w:p>
<w:p><w:pPr><w:pStyle w:val="OriginalTitle"/><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:rFonts w:eastAsia="宋体"/></w:rPr><w:t>投标函</w:t></w:r></w:p>
<w:tbl><w:tblPr><w:tblW w:w="8800" w:type="dxa"/></w:tblPr><w:tr><w:tc><w:tcPr><w:gridSpan w:val="2"/></w:tcPr><w:p><w:r><w:t>签章：____</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
<w:p><w:pPr><w:sectPr><w:pgSz w:w="16838" w:h="11906"/><w:pgMar w:left="720"/></w:sectPr></w:pPr><w:r><w:t>Excluded section end</w:t></w:r></w:p>
<w:p><w:r><w:t>Excluded final section</w:t></w:r></w:p><w:sectPr><w:pgSz w:w="11906" w:h="16838"/></w:sectPr></w:body></w:document>'''
            resources = {"word/styles.xml": b"original styles", "word/numbering.xml": b"original numbering",
                         "word/media/image1.png": bytes(range(256)), "word/header1.xml": b"original header",
                         "word/_rels/document.xml.rels": b"original relationships"}
            with ZipFile(source, "w") as archive:
                archive.writestr("word/document.xml", document.encode())
                for name, value in resources.items():
                    archive.writestr(name, value)
            original_bytes = source.read_bytes()
            self.assertEqual(list_blocks(source)[2]["block"], 3)
            result = extract_docx(source, target, 2, 3)
            self.assertEqual(result["mode"], "native-docx")
            self.assertEqual(source.read_bytes(), original_bytes)
            with ZipFile(target) as archive:
                for name, value in resources.items():
                    self.assertEqual(archive.read(name), value)
                xml = archive.read("word/document.xml")
            doc = minidom.parseString(xml)
            self.assertNotIn(b"Excluded", xml)
            self.assertIn(b'mc:Ignorable="w14"', xml)
            self.assertEqual(doc.getElementsByTagNameNS(W, "gridSpan")[0].getAttributeNS(W, "val"), "2")
            self.assertEqual(doc.getElementsByTagNameNS(W, "pgSz")[0].getAttributeNS(W, "w"), "16838")
            self.assertEqual(len(doc.getElementsByTagNameNS(W, "headerReference")), 1)
            self.assertEqual(len(doc.getElementsByTagNameNS(W, "sectPr")), 1)
            with self.assertRaises(ValueError):
                extract_docx(source, target, 0, 9)

    def test_pdf_preserves_selected_page_pixels_order_and_dimensions(self):
        import pymupdf
        with tempfile.TemporaryDirectory() as directory:
            source, target = Path(directory) / "source.pdf", Path(directory) / "template.docx"
            with pymupdf.open() as pdf:
                for size in [(595, 842), (842, 595), (420, 595)]:
                    page = pdf.new_page(width=size[0], height=size[1])
                    page.insert_text((20, 40), f"Original template {len(pdf)}")
                    page.draw_rect((20, 55, 220, 180), color=(0.2, 0.4, 0.6))
                pdf.save(source)
            result = extract_pdf(source, target, "2-3", 96)
            self.assertEqual(result["pages"], [2, 3])
            with ZipFile(target) as archive, pymupdf.open(source) as pdf:
                self.assertEqual(archive.read("word/media/page-1.png"), pdf[1].get_pixmap(dpi=96, alpha=False).tobytes("png"))
                self.assertEqual(archive.read("word/media/page-2.png"), pdf[2].get_pixmap(dpi=96, alpha=False).tobytes("png"))
                doc = minidom.parseString(archive.read("word/document.xml"))
                sizes = doc.getElementsByTagNameNS(W, "pgSz")
                self.assertEqual([n.getAttributeNS(W, "w") for n in sizes], [str(842 * 20), str(420 * 20)])
                self.assertEqual(len(doc.getElementsByTagNameNS(W, "p")), 2)
            for pages in ["0", "4", "3-2", "1,1", "3,2"]:
                with self.assertRaises(ValueError):
                    parse_pages(pages, 3)


if __name__ == "__main__":
    unittest.main()
