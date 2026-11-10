import unittest
from render_report import skeleton
from render_host_report import render


class HostReportTest(unittest.TestCase):
    def test_all_modules_dynamic_groups_and_evidence_survive_projection(self):
        data = skeleton()
        data.update(document_title='采购文件', source_files=['采购文件.docx'])
        data['coverage'] = {'status': 'complete', 'summary': '已读取全文', 'unread': []}
        for index, module in enumerate(data['modules']):
            module['sections'] = [{
                'id': f's{index}', 'title': f'原文分组{index}', 'blocks': [{
                    'kind': 'table', 'columns': ['条款', '要求'], 'rows': [{
                        'cells': [f'条款{index}', ['第一行', '第二行']], 'basis': 'explicit',
                        'evidence': [{'file': '采购文件.docx', 'locator': f'正文块{index}', 'quote': f'原文{index}'}],
                    }],
                }],
            }]
        result = render(data)
        self.assertEqual(len(result['sections']), 10)
        for index, module in enumerate(result['sections']):
            self.assertEqual(module['title'], data['modules'][index]['title'])
            row = module['groups'][0]['blocks'][0]['rows'][0]
            self.assertEqual(row['cells'], [f'条款{index}', '第一行\n第二行'])
            self.assertIn(f'正文块{index}', row['source'])
            self.assertNotIn('出处', row['cells'][1])

    def test_invalid_old_template_data_is_not_silently_declared_native_word(self):
        data = skeleton()
        data['schema_version'] = 1
        with self.assertRaises(ValueError):
            render(data)


if __name__ == '__main__':
    unittest.main()
