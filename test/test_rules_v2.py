# Run: python3 -m unittest discover -s test -p 'test_*.py'
import json, os, sys, tempfile, unittest

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'scripts'))
import rules_v2 as R  # noqa: E402

GOOD_SRC = """
window.STRETCH=1.0;
window.COVER={t:0.2,title:'איזו קומה?'};
window.PROMPT={t:1.2,text:'1, 2 או 3 בתגובות'};
"""


def item(**kw):
    base = {'reel': 1027, 'episode': 'r1027', 'name': 'reel-h027-pick-x', 'caption': 'x',
            'format': 'pick', 'slot': '2026-11-22 13'}
    base.update(kw)
    return base


class PreCheck(unittest.TestCase):
    def setUp(self):
        self.sent = tempfile.mkdtemp()

    def mark(self, reel, slot):
        with open(os.path.join(self.sent, f'{reel}.json'), 'w') as f:
            json.dump({'reel': reel, 'slot': slot}, f)

    def test_good_reel_passes(self):
        R.pre_check(item(), GOOD_SRC, self.sent)

    def test_applies_to_daily_reels_from_h27_and_to_any_item_with_format(self):
        self.assertTrue(R.applies({'reel': 1027}))
        self.assertFalse(R.applies({'reel': 1026}))
        self.assertFalse(R.applies({'reel': 57}))
        self.assertTrue(R.applies({'reel': 57, 'format': 'pick'}))

    def test_missing_format_slot_cover_prompt(self):
        with self.assertRaises(ValueError) as e:
            R.pre_check(item(format=None, slot='tomorrow'), 'window.STRETCH=1.0;', self.sent)
        msg = str(e.exception)
        for words in ('"format"', '"slot"', 'COVER', 'PROMPT'):
            self.assertIn(words, msg)

    def test_late_prompt_counts_the_stretch(self):
        src = GOOD_SRC.replace('t:1.2', 't:2.8').replace('STRETCH=1.0', 'STRETCH=1.10')
        with self.assertRaisesRegex(ValueError, 'by 3s'):
            R.pre_check(item(), src, self.sent)

    def test_stretch_over_limit(self):
        with self.assertRaisesRegex(ValueError, 'STRETCH'):
            R.pre_check(item(), GOOD_SRC.replace('STRETCH=1.0', 'STRETCH=1.12'), self.sent)

    def test_feat_card_only_in_feature_reels(self):
        src = GOOD_SRC + 'FEAT.tours(3,5);'
        with self.assertRaisesRegex(ValueError, 'FEAT'):
            R.pre_check(item(format='pain'), src, self.sent)
        R.pre_check(item(format='feature'), src, self.sent)

    def test_slot_lock_and_replaces(self):
        self.mark(1027, '2026-11-22 13')
        with self.assertRaisesRegex(ValueError, 'already has reel 1027'):
            R.pre_check(item(reel=1028, episode='r1028'), GOOD_SRC, self.sent)
        R.pre_check(item(reel=1028, episode='r1028', replaces=1027), GOOD_SRC, self.sent)
        R.pre_check(item(reel=1028, episode='r1028', slot='2026-11-22 20'), GOOD_SRC, self.sent)
        R.pre_check(item(), GOOD_SRC, self.sent)  # its own marker does not block a retry


class PostCheck(unittest.TestCase):
    def test_length_by_format(self):
        R.post_check(item(), 12.0, None, None)
        with self.assertRaisesRegex(RuntimeError, 'Pick one'):
            R.post_check(item(), 21.6, None, None)
        with self.assertRaisesRegex(RuntimeError, 'Roommate'):
            R.post_check(item(format='roommate'), 13.5, None, None)

    def test_brand_ending(self):
        beats = {'dur': 12.0, 'wordmarks': [10.0], 'endcard': None}
        with self.assertRaisesRegex(RuntimeError, 'brand ending'):
            R.post_check(item(), 12.0, beats, None)
        R.post_check(item(), 12.0, {'dur': 12.0, 'wordmarks': [11.1], 'endcard': None}, None)
        # a wordmark in the first half is not the ending
        R.post_check(item(), 12.0, {'dur': 12.0, 'wordmarks': [0.0], 'endcard': None}, None)

    def test_end_card_only_in_feature(self):
        beats = {'dur': 12.0, 'wordmarks': [], 'endcard': 10.7}
        with self.assertRaisesRegex(RuntimeError, 'endCard'):
            R.post_check(item(), 12.0, beats, None)
        R.post_check(item(format='feature'), 12.0, beats, None)

    def test_voice_budget(self):
        voice = {'say': [[0.4, 2.0, 'א' * 150], [3.0, 5.0, 'ב' * 100]]}
        with self.assertRaisesRegex(RuntimeError, 'spoken characters'):
            R.post_check(item(), 12.0, None, voice)
        R.post_check(item(), 12.0, None, {'say': [[0.4, 2.0, 'א' * 150]]})


if __name__ == '__main__':
    unittest.main()
