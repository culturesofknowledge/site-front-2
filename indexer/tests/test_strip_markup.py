import csv
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'lib'))

from conversionhelper import strip_markup
import csvtordf

NEW = os.getenv('NEW_CSV_DIR')
OLD = os.getenv('OLD_CSV_DIR')


class StripMarkup(unittest.TestCase):

    def test_plain_text_is_untouched(self):
        for v in ['Oxford', 'a  b\nc', 'Cork & Orrery', '1 < 2 and 3 > 2', "Schröder, John, 1680-1756"]:
            self.assertEqual(strip_markup(v), v)

    def test_tags_and_entities(self):
        self.assertEqual(strip_markup('Schr&#x00F6;der, John'), 'Schröder, John')
        self.assertEqual(strip_markup('Cork &amp; Orrery'), 'Cork & Orrery')
        self.assertEqual(strip_markup('<p>one</p><p>two</p>'), 'one two')
        self.assertEqual(strip_markup('a <note><p>b</p></note> <lb/>c'), 'a b c')

    def test_tag_words_not_searchable(self):
        self.assertNotIn('bold', strip_markup('<emph render="bold">word</emph>'))

    def test_every_markup_column_is_wired(self):
        cols = {c['title_singular']: c['translations'] for c in csvtordf.conversions}
        wired = [('work', 'abstract'), ('work', 'authors_as_marked'), ('work', 'addressees_as_marked'),
                 ('work', 'origin_as_marked'), ('work', 'destination_as_marked'),
                 ('work', 'description'), ('work', 'incipit'), ('comment', 'comment'),
                 ('person', 'foaf_name'), ('person', 'skos_altlabel')]
        for table, col in wired:
            self.assertIs(cols[table][col].get('converter'), strip_markup, (table, col))
        self.assertTrue(cols['work']['abstract'].get('keep_html'))

    @unittest.skipUnless(NEW and OLD, 'set NEW_CSV_DIR and OLD_CSV_DIR for the data check')
    def test_old_plain_records_index_identically(self):
        # every value that was plain text in the old export must come out unchanged
        csv.field_size_limit(10**9)
        for table, fname in [('work', 'work.csv'), ('person', 'person.csv'), ('comment', 'comment.csv')]:
            cols = [k for k, t in {c['title_singular']: c['translations'] for c in csvtordf.conversions}[table].items()
                    if t and t.get('converter') is strip_markup]
            with open(os.path.join(OLD, fname), newline='', encoding='utf-8') as f:
                for row in csv.DictReader(f):
                    for k in cols:
                        v = (row.get(k) or '').strip()
                        if '<' not in v and '&#' not in v and '&amp;' not in v:
                            self.assertEqual(strip_markup(v), v)


if __name__ == '__main__':
    unittest.main()
